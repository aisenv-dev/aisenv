import fs from 'node:fs/promises';
import path from 'node:path';

const DIRNAME_DOWNLOADS = '.aiscript-tmlanguage';
const FILENAME_AISCRIPT_TMLANGUAGE = 'aiscript.tmLanguage.json';
const FILENAME_VERSION = 'VERSION';

function panic(message) {
    console.error(message);
    process.exit(1);
}

async function getCachedVersion() {
    const versionPath = path.resolve(DIRNAME_DOWNLOADS, FILENAME_VERSION);
    try {
        return await fs.readFile(versionPath, 'utf-8');
    } catch {
        return undefined;
    }
}

async function fetchAiscriptTmlanguage(version) {
    const url = new URL(
        `https://raw.githubusercontent.com/aiscript-dev/aiscript-vscode/refs/tags/${version}/aiscript/syntaxes/aiscript.tmLanguage.json`,
    );
    console.log(`downloading file from ${url}`);
    const response = await fetch(url);
    const text = await response.text();
    if (!response.ok) {
        panic(
            `server responded with error: "${text}" (status: ${response.status})`,
        );
    }
    return text;
}

async function writeFiles(text, version) {
    await fs.mkdir(DIRNAME_DOWNLOADS, { recursive: true });
    await fs.writeFile(
        path.resolve(DIRNAME_DOWNLOADS, FILENAME_AISCRIPT_TMLANGUAGE),
        text,
        'utf-8',
    );
    await fs.writeFile(
        path.resolve(DIRNAME_DOWNLOADS, FILENAME_VERSION),
        version,
        'utf-8',
    );
}

async function downloadAiscriptTmlanguage(version) {
    const cachedVersion = await getCachedVersion();
    if (cachedVersion == version) {
        return;
    }
    const text = await fetchAiscriptTmlanguage(version);
    writeFiles(text, version);
}

const aiscriptTmlanguageVersion =
    process.env.npm_package_config_aiscript_tmlanguage_version;
if (aiscriptTmlanguageVersion == null) {
    panic(`"aiscript_tmlanguage_version" is not set`);
}
await downloadAiscriptTmlanguage(aiscriptTmlanguageVersion);
