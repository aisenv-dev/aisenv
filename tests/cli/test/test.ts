import { beforeEach, describe, expect, test, vi } from 'vitest';
import * as modTest from '../../../src/cli/test/test.js';
import { Config } from '../../../src/api/config.js';
import mockFs from 'mock-fs';

vi.mock('node:url', async () => {
    return {
        pathToFileURL() {
            return {
                toString: () => 'aisenv.config.js',
            };
        },
    };
});

const mockResolveConfig = vi.hoisted(() =>
    vi.fn<typeof import('../../../src/common/config.js').resolveConfig>(),
);

vi.mock('../../../src/common/config.js', async () => {
    return {
        resolveConfig: mockResolveConfig,
    };
});

vi.mock('aisenv.config.js', async () => {
    return {
        default: {
            test: {
                include: ['*.test.ais'],
            },
        } satisfies Config,
    };
});

describe('test', () => {
    beforeEach(() => {
        mockFs.restore();
        vi.resetAllMocks();
    });

    test('read config', async () => {
        mockResolveConfig.mockImplementationOnce(async () => ({
            test: { include: ['*.test.ais'] },
        }));
        mockFs({
            'main.test.ais': `
                #[test]
                @do_nothing() {}
            `,
        });
        const result = await modTest.test();
        expect(result).toBe(true);
        expect(mockResolveConfig).toHaveBeenCalledOnce();
    });

    test('test not defined in config', async () => {
        mockResolveConfig.mockImplementationOnce(async () => ({}));
        await expect(() => modTest.test()).rejects.toStrictEqual(
            new TypeError('test not defined'),
        );
        expect(mockResolveConfig).toHaveBeenCalledOnce();
    });

    test('fail test', async () => {
        mockResolveConfig.mockImplementationOnce(async () => ({
            test: { include: ['*.test.ais'] },
        }));
        mockFs({
            'main.test.ais': `
                #[test]
                @fail() {
                    Core:abort('this test should fail')
                }
            `,
        });
        const result = await modTest.test();
        expect(result).toBe(false);
        expect(mockResolveConfig).toHaveBeenCalledOnce();
    });

    test('empty test file', async () => {
        mockResolveConfig.mockImplementationOnce(async () => ({
            test: { include: ['*.test.ais'] },
        }));
        mockFs({ 'main.test.ais': '' });
        const result = await modTest.test();
        expect(result).toBe(true);
        expect(mockResolveConfig).toHaveBeenCalledOnce();
    });

    test('syntax error', async () => {
        mockResolveConfig.mockImplementationOnce(async () => ({
            test: { include: ['*.test.ais'] },
        }));
        mockFs({ 'main.test.ais': '#' });
        const result = await modTest.test();
        expect(result).toBe(false);
        expect(mockResolveConfig).toHaveBeenCalledOnce();
    });

    test('runtime error', async () => {
        mockResolveConfig.mockImplementationOnce(async () => ({
            test: { include: ['*.test.ais'] },
        }));
        mockFs({ 'main.test.ais': 'Core:abort("err")' });
        const result = await modTest.test();
        expect(result).toBe(false);
        expect(mockResolveConfig).toHaveBeenCalledOnce();
    });

    test('should abort', async () => {
        mockResolveConfig.mockImplementationOnce(async () => ({
            test: { include: ['*.test.ais'] },
        }));
        mockFs({
            'main.test.ais': `
                #[test "err"]
                @should_fail() {
                    Core:abort("err")
                }
            `,
        });
        const result = await modTest.test();
        expect(result).toBe(true);
        expect(mockResolveConfig).toHaveBeenCalledOnce();
    });

    test('should abort but did not', async () => {
        mockResolveConfig.mockImplementationOnce(async () => ({
            test: { include: ['*.test.ais'] },
        }));
        mockFs({
            'main.test.ais': `
                #[test "err"]
                @should_fail() {}
            `,
        });
        const result = await modTest.test();
        expect(result).toBe(false);
        expect(mockResolveConfig).toHaveBeenCalledOnce();
    });

    test('standard input', async () => {
        mockResolveConfig.mockImplementationOnce(async () => ({
            test: { include: ['*.test.ais'] },
        }));
        mockFs({
            'main.test.ais': 'readline("q")',
        });
        const result = await modTest.test();
        expect(result).toBe(true);
        expect(mockResolveConfig).toHaveBeenCalledOnce();
    });

    test('does not run unattributed function', async () => {
        mockResolveConfig.mockImplementationOnce(async () => ({
            test: { include: ['*.test.ais'] },
        }));
        mockFs({
            'main.test.ais': `
                @func() {
                    Core:abort('err')
                }
            `,
        });
        const result = await modTest.test();
        expect(result).toBe(true);
        expect(mockResolveConfig).toHaveBeenCalledOnce();
    });

    describe('attribute', () => {
        test('unknown attribute', async () => {
            mockResolveConfig.mockImplementationOnce(async () => ({
                test: { include: ['*.test.ais'] },
            }));
            mockFs({
                'main.test.ais': `
                    #[invalid]
                    @test() {}
                `,
            });
            const result = await modTest.test();
            expect(result).toBe(false);
            expect(mockResolveConfig).toHaveBeenCalledOnce();
        });

        test('non a function', async () => {
            mockResolveConfig.mockImplementationOnce(async () => ({
                test: { include: ['*.test.ais'] },
            }));
            mockFs({
                'main.test.ais': `
                    #[test]
                    let a = 42
                `,
            });
            const result = await modTest.test();
            expect(result).toBe(false);
            expect(mockResolveConfig).toHaveBeenCalledOnce();
        });

        test('unexpected test attribute string', async () => {
            mockResolveConfig.mockImplementationOnce(async () => ({
                test: { include: ['*.test.ais'] },
            }));
            mockFs({
                'main.test.ais': `
                    #[test 'invalid']
                    @test() {}
                `,
            });
            const result = await modTest.test();
            expect(result).toBe(false);
            expect(mockResolveConfig).toHaveBeenCalledOnce();
        });

        test('unexpected test attribute type', async () => {
            mockResolveConfig.mockImplementationOnce(async () => ({
                test: { include: ['*.test.ais'] },
            }));
            mockFs({
                'main.test.ais': `
                    #[test 42]
                    @test() {}
                `,
            });
            const result = await modTest.test();
            expect(result).toBe(false);
            expect(mockResolveConfig).toHaveBeenCalledOnce();
        });
    });

    describe('imports', () => {
        test('executes import file', async () => {
            mockResolveConfig.mockImplementationOnce(async () => ({
                test: { include: ['*.test.ais'] },
            }));
            mockFs({
                'main.ais': '@callable() {}',
                'main.test.ais': `
                    ### imports ['main.ais']
                    callable()
                `,
            });
            const result = await modTest.test();
            expect(result).toBe(true);
            expect(mockResolveConfig).toHaveBeenCalledOnce();
        });

        test('imports not an array', async () => {
            mockResolveConfig.mockImplementationOnce(async () => ({
                test: { include: ['*.test.ais'] },
            }));
            mockFs({
                'main.test.ais': `
                    ### imports 42
                `,
            });
            const result = await modTest.test();
            expect(result).toBe(false);
            expect(mockResolveConfig).toHaveBeenCalledOnce();
        });

        test('invalid import path', async () => {
            mockResolveConfig.mockImplementationOnce(async () => ({
                test: { include: ['*.test.ais'] },
            }));
            mockFs({
                'main.test.ais': `
                    ### imports [42]
                `,
            });
            const result = await modTest.test();
            expect(result).toBe(false);
            expect(mockResolveConfig).toHaveBeenCalledOnce();
        });
    });
});
