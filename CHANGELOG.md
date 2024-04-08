# CHANGELOG

## 1.15.3 (2024-04-08)

* Update `synvert-core` to 2.19.3

## 1.15.2 (2024-04-08)

* Use package `@synvert-hq/synvert-core`
* Rename package to `@synvert-hq/synvert`

## 1.15.1 (2024-04-08)

* Moving from `@xinminlabs` to `@synvert-hq`
* Do not show espree version

## 1.15.0 (2024-02-19)

* Update `synvert-core` to 2.19.0
* Add `--dont-respect-gitignore` flag

## 1.14.8 (2023-10-29)

* Update `synvert-core` to 2.17.6
* Abstract command from cli

## 1.14.7 (2023-09-30)

* Update `synvert-core` to 2.17.0

## 1.14.6 (2023-07-16)

* Update `synvert-core` to 2.16.4

## 1.14.5 (2023-06-07)

* Update `synvert-core` to 2.16.2

## 1.14.4 (2023-03-18)

* Update `synvert-core` to 2.12.2

## 1.14.3 (2023-02-18)

* Update `synvert-core` to 2.12.1

## 1.14.2 (2023-02-24)

* Update generated snippet

## 1.14.1 (2023-02-18)

* Update `synvert-core` to 2.12.0

## 1.14.0 (2023-02-08)

* Add `--tab-width` flag
* Update `synvert-core` to 2.10.0

## 1.13.0 (2023-02-08)

* Add `--no-semi` flag
* Update `synvert-core` to 2.9.0

## 1.12.0 (2023-02-07)

* Add `--single-quote` flag
* Update `synvert-core` to 2.7.0

## 1.11.0 (2023-02-05)

* Use kebab case

## 1.10.3 (2023-01-01)

* Update `synvert-core` to 2.4.4

## 1.10.2 (2022-12-30)

* Update `synvert-core` to 2.4.3

## 1.10.1 (2022-12-18)

* Fix snippet input

## 1.10.0 (2022-12-17)

* Add `--maxFileSize` option

## 1.9.0 (2022-12-17)

* Update `synvert-core` to 2.3.0
* Update showVersion result
* Async all commands

## 1.8.1 (2022-12-01)

* Show message if no snippet when listing snippets
* Update `synvert-core` to 1.25.2

## 1.8.0 (2022-11-25)

* Output `affectedFiles` for json format run

## 1.7.5 (2022-11-15)

* Do not read helpers

## 1.7.4 (2022-10-11)

* Use `evalSnippet` from synvert-core
* No need to read rewriters before run or test a snippet

## 1.7.3 (2022-10-10)

* Call `processWithSandbox`
* Revert "remove --format option"

## 1.7.2 (2022-10-08)

* Remove `--format` option

## 1.7.1 (2022-10-07)

* Remove `enableEcmaFeaturesJsx` option

## 1.7.0 (2022-10-05)

* Read rewriters before process and test a snippet to support sub snippets
* Eval snippet to get rewriter

## 1.6.1 (2022-09-18)

* Snakecase keys in list json results

## 1.6.0 (2022-09-18)

* Snakecase keys in test json results

## 1.5.0 (2022-09-05)

* Update `synvert-core` to 1.9.5
* Convert to github raw url

## 1.4.0 (2022-08-30)

* Update `synvert-core` to 1.8.0
* Rename `path` option to `rootPath`
* Rename `skipFiles` option to `skipPaths`
* Add `onlyPaths` option

## 1.3.0 (2022-07-27)

* Fix NodeVM `require.resolve` for global npm package
* Fix npm package

## 1.2.0 (2022-08-27)

* Test a snippet
* Execute a snippet
* Update `synvert-core` to 1.6.4

## 1.1.0 (2022-08-20)

* Rename `loadSnippets` to `readSnippets`
* Use `vm2` instead of `eval`
* Run a snippet from remote url or local file path

## 1.0.0 (2022-06-01)

* Migrate to Typescript
* Update `synvert-core` to 1.0.1

## 0.16.2 (2022-03-16)

* Update `synvert-core` to 0.40.0

## 0.16.1 (2022-03-05)

* Output message after generating a snippet.
* Update generated snippet code.
* Update `synvert-core` to 0.39.1

## 0.16.0 (2022-03-03)

* Load custom snippet

## 0.15.0 (2022-02-27)

* Output json format
* Update `synvert-core` to 0.39.0

## 0.14.0 (2022-01-27)

* Update `synvert-core` to 0.36.0
* Add `xinminlabs-espree` package
* Add `glob` package

## 0.13.0 (2022-01-26)

* Use `xinminlabs-espree` instead of `espree`

## 0.12.0 (2021-10-04)

* Update synvert-core when syncing

## 0.11.0 (2021-10-02)

* Ask user to update synvert
* Fix `group` and `name` in generated snippet
* Update `synvert-core` to 0.27.1

## 0.10.1 (2021-09-26)

* Rename `withFiles` to `withinFiles`

## 0.10.0 (2021-09-26)

* Generate a snippet

## 0.9.0 (2021-09-25)

* Show version with synvert-core and espree versions
* Update synvert-core when syncing snippets

## 0.8.0 (2021-09-12)

* Add `enableEcmaFeaturesJsx` option

## 0.7.0 (2021-09-11)

* Add `showRunProcess` option

## 0.6.0 (2021-08-30)

* Configure skipFiles and path

## 0.5.0 (2021-08-29)

* Show a snippet

## 0.4.0 (2021-08-29)

* Run a snippet

## 0.3.0 (2021-08-22)

* List snippets

## 0.2.0 (2021-08-21)

* Sync snippets
