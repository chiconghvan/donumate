#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/error.js
var require_error = __commonJS({
  "node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/error.js"(exports) {
    var CommanderError2 = class extends Error {
      /**
       * Constructs the CommanderError class
       * @param {number} exitCode suggested exit code which could be used with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       */
      constructor(exitCode, code, message) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.code = code;
        this.exitCode = exitCode;
        this.nestedError = void 0;
      }
    };
    var InvalidArgumentError2 = class extends CommanderError2 {
      /**
       * Constructs the InvalidArgumentError class
       * @param {string} [message] explanation of why argument is invalid
       */
      constructor(message) {
        super(1, "commander.invalidArgument", message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
      }
    };
    exports.CommanderError = CommanderError2;
    exports.InvalidArgumentError = InvalidArgumentError2;
  }
});

// node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/argument.js
var require_argument = __commonJS({
  "node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/argument.js"(exports) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Argument2 = class {
      /**
       * Initialize a new command argument with the given name and description.
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @param {string} name
       * @param {string} [description]
       */
      constructor(name, description) {
        this.description = description || "";
        this.variadic = false;
        this.parseArg = void 0;
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.argChoices = void 0;
        switch (name[0]) {
          case "<":
            this.required = true;
            this._name = name.slice(1, -1);
            break;
          case "[":
            this.required = false;
            this._name = name.slice(1, -1);
            break;
          default:
            this.required = true;
            this._name = name;
            break;
        }
        if (this._name.length > 3 && this._name.slice(-3) === "...") {
          this.variadic = true;
          this._name = this._name.slice(0, -3);
        }
      }
      /**
       * Return argument name.
       *
       * @return {string}
       */
      name() {
        return this._name;
      }
      /**
       * @package
       */
      _concatValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        return previous.concat(value);
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Argument}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Set the custom handler for processing CLI command arguments into argument values.
       *
       * @param {Function} [fn]
       * @return {Argument}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Only allow argument value to be one of choices.
       *
       * @param {string[]} values
       * @return {Argument}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(
              `Allowed choices are ${this.argChoices.join(", ")}.`
            );
          }
          if (this.variadic) {
            return this._concatValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Make argument required.
       *
       * @returns {Argument}
       */
      argRequired() {
        this.required = true;
        return this;
      }
      /**
       * Make argument optional.
       *
       * @returns {Argument}
       */
      argOptional() {
        this.required = false;
        return this;
      }
    };
    function humanReadableArgName(arg) {
      const nameOutput = arg.name() + (arg.variadic === true ? "..." : "");
      return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
    }
    exports.Argument = Argument2;
    exports.humanReadableArgName = humanReadableArgName;
  }
});

// node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/help.js
var require_help = __commonJS({
  "node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/help.js"(exports) {
    var { humanReadableArgName } = require_argument();
    var Help2 = class {
      constructor() {
        this.helpWidth = void 0;
        this.minWidthToWrap = 40;
        this.sortSubcommands = false;
        this.sortOptions = false;
        this.showGlobalOptions = false;
      }
      /**
       * prepareContext is called by Commander after applying overrides from `Command.configureHelp()`
       * and just before calling `formatHelp()`.
       *
       * Commander just uses the helpWidth and the rest is provided for optional use by more complex subclasses.
       *
       * @param {{ error?: boolean, helpWidth?: number, outputHasColors?: boolean }} contextOptions
       */
      prepareContext(contextOptions) {
        this.helpWidth = this.helpWidth ?? contextOptions.helpWidth ?? 80;
      }
      /**
       * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
       *
       * @param {Command} cmd
       * @returns {Command[]}
       */
      visibleCommands(cmd) {
        const visibleCommands = cmd.commands.filter((cmd2) => !cmd2._hidden);
        const helpCommand = cmd._getHelpCommand();
        if (helpCommand && !helpCommand._hidden) {
          visibleCommands.push(helpCommand);
        }
        if (this.sortSubcommands) {
          visibleCommands.sort((a, b) => {
            return a.name().localeCompare(b.name());
          });
        }
        return visibleCommands;
      }
      /**
       * Compare options for sort.
       *
       * @param {Option} a
       * @param {Option} b
       * @returns {number}
       */
      compareOptions(a, b) {
        const getSortKey = (option) => {
          return option.short ? option.short.replace(/^-/, "") : option.long.replace(/^--/, "");
        };
        return getSortKey(a).localeCompare(getSortKey(b));
      }
      /**
       * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleOptions(cmd) {
        const visibleOptions = cmd.options.filter((option) => !option.hidden);
        const helpOption = cmd._getHelpOption();
        if (helpOption && !helpOption.hidden) {
          const removeShort = helpOption.short && cmd._findOption(helpOption.short);
          const removeLong = helpOption.long && cmd._findOption(helpOption.long);
          if (!removeShort && !removeLong) {
            visibleOptions.push(helpOption);
          } else if (helpOption.long && !removeLong) {
            visibleOptions.push(
              cmd.createOption(helpOption.long, helpOption.description)
            );
          } else if (helpOption.short && !removeShort) {
            visibleOptions.push(
              cmd.createOption(helpOption.short, helpOption.description)
            );
          }
        }
        if (this.sortOptions) {
          visibleOptions.sort(this.compareOptions);
        }
        return visibleOptions;
      }
      /**
       * Get an array of the visible global options. (Not including help.)
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleGlobalOptions(cmd) {
        if (!this.showGlobalOptions) return [];
        const globalOptions = [];
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          const visibleOptions = ancestorCmd.options.filter(
            (option) => !option.hidden
          );
          globalOptions.push(...visibleOptions);
        }
        if (this.sortOptions) {
          globalOptions.sort(this.compareOptions);
        }
        return globalOptions;
      }
      /**
       * Get an array of the arguments if any have a description.
       *
       * @param {Command} cmd
       * @returns {Argument[]}
       */
      visibleArguments(cmd) {
        if (cmd._argsDescription) {
          cmd.registeredArguments.forEach((argument) => {
            argument.description = argument.description || cmd._argsDescription[argument.name()] || "";
          });
        }
        if (cmd.registeredArguments.find((argument) => argument.description)) {
          return cmd.registeredArguments;
        }
        return [];
      }
      /**
       * Get the command term to show in the list of subcommands.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandTerm(cmd) {
        const args = cmd.registeredArguments.map((arg) => humanReadableArgName(arg)).join(" ");
        return cmd._name + (cmd._aliases[0] ? "|" + cmd._aliases[0] : "") + (cmd.options.length ? " [options]" : "") + // simplistic check for non-help option
        (args ? " " + args : "");
      }
      /**
       * Get the option term to show in the list of options.
       *
       * @param {Option} option
       * @returns {string}
       */
      optionTerm(option) {
        return option.flags;
      }
      /**
       * Get the argument term to show in the list of arguments.
       *
       * @param {Argument} argument
       * @returns {string}
       */
      argumentTerm(argument) {
        return argument.name();
      }
      /**
       * Get the longest command term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestSubcommandTermLength(cmd, helper) {
        return helper.visibleCommands(cmd).reduce((max, command) => {
          return Math.max(
            max,
            this.displayWidth(
              helper.styleSubcommandTerm(helper.subcommandTerm(command))
            )
          );
        }, 0);
      }
      /**
       * Get the longest option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestOptionTermLength(cmd, helper) {
        return helper.visibleOptions(cmd).reduce((max, option) => {
          return Math.max(
            max,
            this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option)))
          );
        }, 0);
      }
      /**
       * Get the longest global option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestGlobalOptionTermLength(cmd, helper) {
        return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
          return Math.max(
            max,
            this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option)))
          );
        }, 0);
      }
      /**
       * Get the longest argument term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestArgumentTermLength(cmd, helper) {
        return helper.visibleArguments(cmd).reduce((max, argument) => {
          return Math.max(
            max,
            this.displayWidth(
              helper.styleArgumentTerm(helper.argumentTerm(argument))
            )
          );
        }, 0);
      }
      /**
       * Get the command usage to be displayed at the top of the built-in help.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandUsage(cmd) {
        let cmdName = cmd._name;
        if (cmd._aliases[0]) {
          cmdName = cmdName + "|" + cmd._aliases[0];
        }
        let ancestorCmdNames = "";
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          ancestorCmdNames = ancestorCmd.name() + " " + ancestorCmdNames;
        }
        return ancestorCmdNames + cmdName + " " + cmd.usage();
      }
      /**
       * Get the description for the command.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandDescription(cmd) {
        return cmd.description();
      }
      /**
       * Get the subcommand summary to show in the list of subcommands.
       * (Fallback to description for backwards compatibility.)
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandDescription(cmd) {
        return cmd.summary() || cmd.description();
      }
      /**
       * Get the option description to show in the list of options.
       *
       * @param {Option} option
       * @return {string}
       */
      optionDescription(option) {
        const extraInfo = [];
        if (option.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (option.defaultValue !== void 0) {
          const showDefault = option.required || option.optional || option.isBoolean() && typeof option.defaultValue === "boolean";
          if (showDefault) {
            extraInfo.push(
              `default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`
            );
          }
        }
        if (option.presetArg !== void 0 && option.optional) {
          extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
        }
        if (option.envVar !== void 0) {
          extraInfo.push(`env: ${option.envVar}`);
        }
        if (extraInfo.length > 0) {
          return `${option.description} (${extraInfo.join(", ")})`;
        }
        return option.description;
      }
      /**
       * Get the argument description to show in the list of arguments.
       *
       * @param {Argument} argument
       * @return {string}
       */
      argumentDescription(argument) {
        const extraInfo = [];
        if (argument.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (argument.defaultValue !== void 0) {
          extraInfo.push(
            `default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`
          );
        }
        if (extraInfo.length > 0) {
          const extraDescription = `(${extraInfo.join(", ")})`;
          if (argument.description) {
            return `${argument.description} ${extraDescription}`;
          }
          return extraDescription;
        }
        return argument.description;
      }
      /**
       * Generate the built-in help text.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {string}
       */
      formatHelp(cmd, helper) {
        const termWidth = helper.padWidth(cmd, helper);
        const helpWidth = helper.helpWidth ?? 80;
        function callFormatItem(term, description) {
          return helper.formatItem(term, termWidth, description, helper);
        }
        let output = [
          `${helper.styleTitle("Usage:")} ${helper.styleUsage(helper.commandUsage(cmd))}`,
          ""
        ];
        const commandDescription = helper.commandDescription(cmd);
        if (commandDescription.length > 0) {
          output = output.concat([
            helper.boxWrap(
              helper.styleCommandDescription(commandDescription),
              helpWidth
            ),
            ""
          ]);
        }
        const argumentList = helper.visibleArguments(cmd).map((argument) => {
          return callFormatItem(
            helper.styleArgumentTerm(helper.argumentTerm(argument)),
            helper.styleArgumentDescription(helper.argumentDescription(argument))
          );
        });
        if (argumentList.length > 0) {
          output = output.concat([
            helper.styleTitle("Arguments:"),
            ...argumentList,
            ""
          ]);
        }
        const optionList = helper.visibleOptions(cmd).map((option) => {
          return callFormatItem(
            helper.styleOptionTerm(helper.optionTerm(option)),
            helper.styleOptionDescription(helper.optionDescription(option))
          );
        });
        if (optionList.length > 0) {
          output = output.concat([
            helper.styleTitle("Options:"),
            ...optionList,
            ""
          ]);
        }
        if (helper.showGlobalOptions) {
          const globalOptionList = helper.visibleGlobalOptions(cmd).map((option) => {
            return callFormatItem(
              helper.styleOptionTerm(helper.optionTerm(option)),
              helper.styleOptionDescription(helper.optionDescription(option))
            );
          });
          if (globalOptionList.length > 0) {
            output = output.concat([
              helper.styleTitle("Global Options:"),
              ...globalOptionList,
              ""
            ]);
          }
        }
        const commandList = helper.visibleCommands(cmd).map((cmd2) => {
          return callFormatItem(
            helper.styleSubcommandTerm(helper.subcommandTerm(cmd2)),
            helper.styleSubcommandDescription(helper.subcommandDescription(cmd2))
          );
        });
        if (commandList.length > 0) {
          output = output.concat([
            helper.styleTitle("Commands:"),
            ...commandList,
            ""
          ]);
        }
        return output.join("\n");
      }
      /**
       * Return display width of string, ignoring ANSI escape sequences. Used in padding and wrapping calculations.
       *
       * @param {string} str
       * @returns {number}
       */
      displayWidth(str) {
        return stripColor(str).length;
      }
      /**
       * Style the title for displaying in the help. Called with 'Usage:', 'Options:', etc.
       *
       * @param {string} str
       * @returns {string}
       */
      styleTitle(str) {
        return str;
      }
      styleUsage(str) {
        return str.split(" ").map((word) => {
          if (word === "[options]") return this.styleOptionText(word);
          if (word === "[command]") return this.styleSubcommandText(word);
          if (word[0] === "[" || word[0] === "<")
            return this.styleArgumentText(word);
          return this.styleCommandText(word);
        }).join(" ");
      }
      styleCommandDescription(str) {
        return this.styleDescriptionText(str);
      }
      styleOptionDescription(str) {
        return this.styleDescriptionText(str);
      }
      styleSubcommandDescription(str) {
        return this.styleDescriptionText(str);
      }
      styleArgumentDescription(str) {
        return this.styleDescriptionText(str);
      }
      styleDescriptionText(str) {
        return str;
      }
      styleOptionTerm(str) {
        return this.styleOptionText(str);
      }
      styleSubcommandTerm(str) {
        return str.split(" ").map((word) => {
          if (word === "[options]") return this.styleOptionText(word);
          if (word[0] === "[" || word[0] === "<")
            return this.styleArgumentText(word);
          return this.styleSubcommandText(word);
        }).join(" ");
      }
      styleArgumentTerm(str) {
        return this.styleArgumentText(str);
      }
      styleOptionText(str) {
        return str;
      }
      styleArgumentText(str) {
        return str;
      }
      styleSubcommandText(str) {
        return str;
      }
      styleCommandText(str) {
        return str;
      }
      /**
       * Calculate the pad width from the maximum term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      padWidth(cmd, helper) {
        return Math.max(
          helper.longestOptionTermLength(cmd, helper),
          helper.longestGlobalOptionTermLength(cmd, helper),
          helper.longestSubcommandTermLength(cmd, helper),
          helper.longestArgumentTermLength(cmd, helper)
        );
      }
      /**
       * Detect manually wrapped and indented strings by checking for line break followed by whitespace.
       *
       * @param {string} str
       * @returns {boolean}
       */
      preformatted(str) {
        return /\n[^\S\r\n]/.test(str);
      }
      /**
       * Format the "item", which consists of a term and description. Pad the term and wrap the description, indenting the following lines.
       *
       * So "TTT", 5, "DDD DDDD DD DDD" might be formatted for this.helpWidth=17 like so:
       *   TTT  DDD DDDD
       *        DD DDD
       *
       * @param {string} term
       * @param {number} termWidth
       * @param {string} description
       * @param {Help} helper
       * @returns {string}
       */
      formatItem(term, termWidth, description, helper) {
        const itemIndent = 2;
        const itemIndentStr = " ".repeat(itemIndent);
        if (!description) return itemIndentStr + term;
        const paddedTerm = term.padEnd(
          termWidth + term.length - helper.displayWidth(term)
        );
        const spacerWidth = 2;
        const helpWidth = this.helpWidth ?? 80;
        const remainingWidth = helpWidth - termWidth - spacerWidth - itemIndent;
        let formattedDescription;
        if (remainingWidth < this.minWidthToWrap || helper.preformatted(description)) {
          formattedDescription = description;
        } else {
          const wrappedDescription = helper.boxWrap(description, remainingWidth);
          formattedDescription = wrappedDescription.replace(
            /\n/g,
            "\n" + " ".repeat(termWidth + spacerWidth)
          );
        }
        return itemIndentStr + paddedTerm + " ".repeat(spacerWidth) + formattedDescription.replace(/\n/g, `
${itemIndentStr}`);
      }
      /**
       * Wrap a string at whitespace, preserving existing line breaks.
       * Wrapping is skipped if the width is less than `minWidthToWrap`.
       *
       * @param {string} str
       * @param {number} width
       * @returns {string}
       */
      boxWrap(str, width) {
        if (width < this.minWidthToWrap) return str;
        const rawLines = str.split(/\r\n|\n/);
        const chunkPattern = /[\s]*[^\s]+/g;
        const wrappedLines = [];
        rawLines.forEach((line) => {
          const chunks = line.match(chunkPattern);
          if (chunks === null) {
            wrappedLines.push("");
            return;
          }
          let sumChunks = [chunks.shift()];
          let sumWidth = this.displayWidth(sumChunks[0]);
          chunks.forEach((chunk) => {
            const visibleWidth = this.displayWidth(chunk);
            if (sumWidth + visibleWidth <= width) {
              sumChunks.push(chunk);
              sumWidth += visibleWidth;
              return;
            }
            wrappedLines.push(sumChunks.join(""));
            const nextChunk = chunk.trimStart();
            sumChunks = [nextChunk];
            sumWidth = this.displayWidth(nextChunk);
          });
          wrappedLines.push(sumChunks.join(""));
        });
        return wrappedLines.join("\n");
      }
    };
    function stripColor(str) {
      const sgrPattern = /\x1b\[\d*(;\d*)*m/g;
      return str.replace(sgrPattern, "");
    }
    exports.Help = Help2;
    exports.stripColor = stripColor;
  }
});

// node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/option.js
var require_option = __commonJS({
  "node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/option.js"(exports) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Option2 = class {
      /**
       * Initialize a new `Option` with the given `flags` and `description`.
       *
       * @param {string} flags
       * @param {string} [description]
       */
      constructor(flags, description) {
        this.flags = flags;
        this.description = description || "";
        this.required = flags.includes("<");
        this.optional = flags.includes("[");
        this.variadic = /\w\.\.\.[>\]]$/.test(flags);
        this.mandatory = false;
        const optionFlags = splitOptionFlags(flags);
        this.short = optionFlags.shortFlag;
        this.long = optionFlags.longFlag;
        this.negate = false;
        if (this.long) {
          this.negate = this.long.startsWith("--no-");
        }
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.presetArg = void 0;
        this.envVar = void 0;
        this.parseArg = void 0;
        this.hidden = false;
        this.argChoices = void 0;
        this.conflictsWith = [];
        this.implied = void 0;
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Option}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Preset to use when option used without option-argument, especially optional but also boolean and negated.
       * The custom processing (parseArg) is called.
       *
       * @example
       * new Option('--color').default('GREYSCALE').preset('RGB');
       * new Option('--donate [amount]').preset('20').argParser(parseFloat);
       *
       * @param {*} arg
       * @return {Option}
       */
      preset(arg) {
        this.presetArg = arg;
        return this;
      }
      /**
       * Add option name(s) that conflict with this option.
       * An error will be displayed if conflicting options are found during parsing.
       *
       * @example
       * new Option('--rgb').conflicts('cmyk');
       * new Option('--js').conflicts(['ts', 'jsx']);
       *
       * @param {(string | string[])} names
       * @return {Option}
       */
      conflicts(names) {
        this.conflictsWith = this.conflictsWith.concat(names);
        return this;
      }
      /**
       * Specify implied option values for when this option is set and the implied options are not.
       *
       * The custom processing (parseArg) is not called on the implied values.
       *
       * @example
       * program
       *   .addOption(new Option('--log', 'write logging information to file'))
       *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
       *
       * @param {object} impliedOptionValues
       * @return {Option}
       */
      implies(impliedOptionValues) {
        let newImplied = impliedOptionValues;
        if (typeof impliedOptionValues === "string") {
          newImplied = { [impliedOptionValues]: true };
        }
        this.implied = Object.assign(this.implied || {}, newImplied);
        return this;
      }
      /**
       * Set environment variable to check for option value.
       *
       * An environment variable is only used if when processed the current option value is
       * undefined, or the source of the current value is 'default' or 'config' or 'env'.
       *
       * @param {string} name
       * @return {Option}
       */
      env(name) {
        this.envVar = name;
        return this;
      }
      /**
       * Set the custom handler for processing CLI option arguments into option values.
       *
       * @param {Function} [fn]
       * @return {Option}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Whether the option is mandatory and must have a value after parsing.
       *
       * @param {boolean} [mandatory=true]
       * @return {Option}
       */
      makeOptionMandatory(mandatory = true) {
        this.mandatory = !!mandatory;
        return this;
      }
      /**
       * Hide option in help.
       *
       * @param {boolean} [hide=true]
       * @return {Option}
       */
      hideHelp(hide = true) {
        this.hidden = !!hide;
        return this;
      }
      /**
       * @package
       */
      _concatValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        return previous.concat(value);
      }
      /**
       * Only allow option value to be one of choices.
       *
       * @param {string[]} values
       * @return {Option}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(
              `Allowed choices are ${this.argChoices.join(", ")}.`
            );
          }
          if (this.variadic) {
            return this._concatValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Return option name.
       *
       * @return {string}
       */
      name() {
        if (this.long) {
          return this.long.replace(/^--/, "");
        }
        return this.short.replace(/^-/, "");
      }
      /**
       * Return option name, in a camelcase format that can be used
       * as an object attribute key.
       *
       * @return {string}
       */
      attributeName() {
        if (this.negate) {
          return camelcase(this.name().replace(/^no-/, ""));
        }
        return camelcase(this.name());
      }
      /**
       * Check if `arg` matches the short or long flag.
       *
       * @param {string} arg
       * @return {boolean}
       * @package
       */
      is(arg) {
        return this.short === arg || this.long === arg;
      }
      /**
       * Return whether a boolean option.
       *
       * Options are one of boolean, negated, required argument, or optional argument.
       *
       * @return {boolean}
       * @package
       */
      isBoolean() {
        return !this.required && !this.optional && !this.negate;
      }
    };
    var DualOptions = class {
      /**
       * @param {Option[]} options
       */
      constructor(options) {
        this.positiveOptions = /* @__PURE__ */ new Map();
        this.negativeOptions = /* @__PURE__ */ new Map();
        this.dualOptions = /* @__PURE__ */ new Set();
        options.forEach((option) => {
          if (option.negate) {
            this.negativeOptions.set(option.attributeName(), option);
          } else {
            this.positiveOptions.set(option.attributeName(), option);
          }
        });
        this.negativeOptions.forEach((value, key) => {
          if (this.positiveOptions.has(key)) {
            this.dualOptions.add(key);
          }
        });
      }
      /**
       * Did the value come from the option, and not from possible matching dual option?
       *
       * @param {*} value
       * @param {Option} option
       * @returns {boolean}
       */
      valueFromOption(value, option) {
        const optionKey = option.attributeName();
        if (!this.dualOptions.has(optionKey)) return true;
        const preset = this.negativeOptions.get(optionKey).presetArg;
        const negativeValue = preset !== void 0 ? preset : false;
        return option.negate === (negativeValue === value);
      }
    };
    function camelcase(str) {
      return str.split("-").reduce((str2, word) => {
        return str2 + word[0].toUpperCase() + word.slice(1);
      });
    }
    function splitOptionFlags(flags) {
      let shortFlag;
      let longFlag;
      const shortFlagExp = /^-[^-]$/;
      const longFlagExp = /^--[^-]/;
      const flagParts = flags.split(/[ |,]+/).concat("guard");
      if (shortFlagExp.test(flagParts[0])) shortFlag = flagParts.shift();
      if (longFlagExp.test(flagParts[0])) longFlag = flagParts.shift();
      if (!shortFlag && shortFlagExp.test(flagParts[0]))
        shortFlag = flagParts.shift();
      if (!shortFlag && longFlagExp.test(flagParts[0])) {
        shortFlag = longFlag;
        longFlag = flagParts.shift();
      }
      if (flagParts[0].startsWith("-")) {
        const unsupportedFlag = flagParts[0];
        const baseError = `option creation failed due to '${unsupportedFlag}' in option flags '${flags}'`;
        if (/^-[^-][^-]/.test(unsupportedFlag))
          throw new Error(
            `${baseError}
- a short flag is a single dash and a single character
  - either use a single dash and a single character (for a short flag)
  - or use a double dash for a long option (and can have two, like '--ws, --workspace')`
          );
        if (shortFlagExp.test(unsupportedFlag))
          throw new Error(`${baseError}
- too many short flags`);
        if (longFlagExp.test(unsupportedFlag))
          throw new Error(`${baseError}
- too many long flags`);
        throw new Error(`${baseError}
- unrecognised flag format`);
      }
      if (shortFlag === void 0 && longFlag === void 0)
        throw new Error(
          `option creation failed due to no flags found in '${flags}'.`
        );
      return { shortFlag, longFlag };
    }
    exports.Option = Option2;
    exports.DualOptions = DualOptions;
  }
});

// node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/suggestSimilar.js
var require_suggestSimilar = __commonJS({
  "node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/suggestSimilar.js"(exports) {
    var maxDistance = 3;
    function editDistance(a, b) {
      if (Math.abs(a.length - b.length) > maxDistance)
        return Math.max(a.length, b.length);
      const d = [];
      for (let i = 0; i <= a.length; i++) {
        d[i] = [i];
      }
      for (let j = 0; j <= b.length; j++) {
        d[0][j] = j;
      }
      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          let cost = 1;
          if (a[i - 1] === b[j - 1]) {
            cost = 0;
          } else {
            cost = 1;
          }
          d[i][j] = Math.min(
            d[i - 1][j] + 1,
            // deletion
            d[i][j - 1] + 1,
            // insertion
            d[i - 1][j - 1] + cost
            // substitution
          );
          if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
            d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
          }
        }
      }
      return d[a.length][b.length];
    }
    function suggestSimilar(word, candidates) {
      if (!candidates || candidates.length === 0) return "";
      candidates = Array.from(new Set(candidates));
      const searchingOptions = word.startsWith("--");
      if (searchingOptions) {
        word = word.slice(2);
        candidates = candidates.map((candidate) => candidate.slice(2));
      }
      let similar = [];
      let bestDistance = maxDistance;
      const minSimilarity = 0.4;
      candidates.forEach((candidate) => {
        if (candidate.length <= 1) return;
        const distance = editDistance(word, candidate);
        const length = Math.max(word.length, candidate.length);
        const similarity = (length - distance) / length;
        if (similarity > minSimilarity) {
          if (distance < bestDistance) {
            bestDistance = distance;
            similar = [candidate];
          } else if (distance === bestDistance) {
            similar.push(candidate);
          }
        }
      });
      similar.sort((a, b) => a.localeCompare(b));
      if (searchingOptions) {
        similar = similar.map((candidate) => `--${candidate}`);
      }
      if (similar.length > 1) {
        return `
(Did you mean one of ${similar.join(", ")}?)`;
      }
      if (similar.length === 1) {
        return `
(Did you mean ${similar[0]}?)`;
      }
      return "";
    }
    exports.suggestSimilar = suggestSimilar;
  }
});

// node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/command.js
var require_command = __commonJS({
  "node_modules/.pnpm/commander@13.1.0/node_modules/commander/lib/command.js"(exports) {
    var EventEmitter = __require("node:events").EventEmitter;
    var childProcess = __require("node:child_process");
    var path2 = __require("node:path");
    var fs = __require("node:fs");
    var process2 = __require("node:process");
    var { Argument: Argument2, humanReadableArgName } = require_argument();
    var { CommanderError: CommanderError2 } = require_error();
    var { Help: Help2, stripColor } = require_help();
    var { Option: Option2, DualOptions } = require_option();
    var { suggestSimilar } = require_suggestSimilar();
    var Command2 = class _Command extends EventEmitter {
      /**
       * Initialize a new `Command`.
       *
       * @param {string} [name]
       */
      constructor(name) {
        super();
        this.commands = [];
        this.options = [];
        this.parent = null;
        this._allowUnknownOption = false;
        this._allowExcessArguments = false;
        this.registeredArguments = [];
        this._args = this.registeredArguments;
        this.args = [];
        this.rawArgs = [];
        this.processedArgs = [];
        this._scriptPath = null;
        this._name = name || "";
        this._optionValues = {};
        this._optionValueSources = {};
        this._storeOptionsAsProperties = false;
        this._actionHandler = null;
        this._executableHandler = false;
        this._executableFile = null;
        this._executableDir = null;
        this._defaultCommandName = null;
        this._exitCallback = null;
        this._aliases = [];
        this._combineFlagAndOptionalValue = true;
        this._description = "";
        this._summary = "";
        this._argsDescription = void 0;
        this._enablePositionalOptions = false;
        this._passThroughOptions = false;
        this._lifeCycleHooks = {};
        this._showHelpAfterError = false;
        this._showSuggestionAfterError = true;
        this._savedState = null;
        this._outputConfiguration = {
          writeOut: (str) => process2.stdout.write(str),
          writeErr: (str) => process2.stderr.write(str),
          outputError: (str, write) => write(str),
          getOutHelpWidth: () => process2.stdout.isTTY ? process2.stdout.columns : void 0,
          getErrHelpWidth: () => process2.stderr.isTTY ? process2.stderr.columns : void 0,
          getOutHasColors: () => useColor() ?? (process2.stdout.isTTY && process2.stdout.hasColors?.()),
          getErrHasColors: () => useColor() ?? (process2.stderr.isTTY && process2.stderr.hasColors?.()),
          stripColor: (str) => stripColor(str)
        };
        this._hidden = false;
        this._helpOption = void 0;
        this._addImplicitHelpCommand = void 0;
        this._helpCommand = void 0;
        this._helpConfiguration = {};
      }
      /**
       * Copy settings that are useful to have in common across root command and subcommands.
       *
       * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
       *
       * @param {Command} sourceCommand
       * @return {Command} `this` command for chaining
       */
      copyInheritedSettings(sourceCommand) {
        this._outputConfiguration = sourceCommand._outputConfiguration;
        this._helpOption = sourceCommand._helpOption;
        this._helpCommand = sourceCommand._helpCommand;
        this._helpConfiguration = sourceCommand._helpConfiguration;
        this._exitCallback = sourceCommand._exitCallback;
        this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
        this._combineFlagAndOptionalValue = sourceCommand._combineFlagAndOptionalValue;
        this._allowExcessArguments = sourceCommand._allowExcessArguments;
        this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
        this._showHelpAfterError = sourceCommand._showHelpAfterError;
        this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;
        return this;
      }
      /**
       * @returns {Command[]}
       * @private
       */
      _getCommandAndAncestors() {
        const result = [];
        for (let command = this; command; command = command.parent) {
          result.push(command);
        }
        return result;
      }
      /**
       * Define a command.
       *
       * There are two styles of command: pay attention to where to put the description.
       *
       * @example
       * // Command implemented using action handler (description is supplied separately to `.command`)
       * program
       *   .command('clone <source> [destination]')
       *   .description('clone a repository into a newly created directory')
       *   .action((source, destination) => {
       *     console.log('clone command called');
       *   });
       *
       * // Command implemented using separate executable file (description is second parameter to `.command`)
       * program
       *   .command('start <service>', 'start named service')
       *   .command('stop [service]', 'stop named service, or all if no name supplied');
       *
       * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
       * @param {(object | string)} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
       * @param {object} [execOpts] - configuration options (for executable)
       * @return {Command} returns new command for action handler, or `this` for executable command
       */
      command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
        let desc = actionOptsOrExecDesc;
        let opts = execOpts;
        if (typeof desc === "object" && desc !== null) {
          opts = desc;
          desc = null;
        }
        opts = opts || {};
        const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);
        const cmd = this.createCommand(name);
        if (desc) {
          cmd.description(desc);
          cmd._executableHandler = true;
        }
        if (opts.isDefault) this._defaultCommandName = cmd._name;
        cmd._hidden = !!(opts.noHelp || opts.hidden);
        cmd._executableFile = opts.executableFile || null;
        if (args) cmd.arguments(args);
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd.copyInheritedSettings(this);
        if (desc) return this;
        return cmd;
      }
      /**
       * Factory routine to create a new unattached command.
       *
       * See .command() for creating an attached subcommand, which uses this routine to
       * create the command. You can override createCommand to customise subcommands.
       *
       * @param {string} [name]
       * @return {Command} new command
       */
      createCommand(name) {
        return new _Command(name);
      }
      /**
       * You can customise the help with a subclass of Help by overriding createHelp,
       * or by overriding Help properties using configureHelp().
       *
       * @return {Help}
       */
      createHelp() {
        return Object.assign(new Help2(), this.configureHelp());
      }
      /**
       * You can customise the help by overriding Help properties using configureHelp(),
       * or with a subclass of Help by overriding createHelp().
       *
       * @param {object} [configuration] - configuration options
       * @return {(Command | object)} `this` command for chaining, or stored configuration
       */
      configureHelp(configuration) {
        if (configuration === void 0) return this._helpConfiguration;
        this._helpConfiguration = configuration;
        return this;
      }
      /**
       * The default output goes to stdout and stderr. You can customise this for special
       * applications. You can also customise the display of errors by overriding outputError.
       *
       * The configuration properties are all functions:
       *
       *     // change how output being written, defaults to stdout and stderr
       *     writeOut(str)
       *     writeErr(str)
       *     // change how output being written for errors, defaults to writeErr
       *     outputError(str, write) // used for displaying errors and not used for displaying help
       *     // specify width for wrapping help
       *     getOutHelpWidth()
       *     getErrHelpWidth()
       *     // color support, currently only used with Help
       *     getOutHasColors()
       *     getErrHasColors()
       *     stripColor() // used to remove ANSI escape codes if output does not have colors
       *
       * @param {object} [configuration] - configuration options
       * @return {(Command | object)} `this` command for chaining, or stored configuration
       */
      configureOutput(configuration) {
        if (configuration === void 0) return this._outputConfiguration;
        Object.assign(this._outputConfiguration, configuration);
        return this;
      }
      /**
       * Display the help or a custom message after an error occurs.
       *
       * @param {(boolean|string)} [displayHelp]
       * @return {Command} `this` command for chaining
       */
      showHelpAfterError(displayHelp = true) {
        if (typeof displayHelp !== "string") displayHelp = !!displayHelp;
        this._showHelpAfterError = displayHelp;
        return this;
      }
      /**
       * Display suggestion of similar commands for unknown commands, or options for unknown options.
       *
       * @param {boolean} [displaySuggestion]
       * @return {Command} `this` command for chaining
       */
      showSuggestionAfterError(displaySuggestion = true) {
        this._showSuggestionAfterError = !!displaySuggestion;
        return this;
      }
      /**
       * Add a prepared subcommand.
       *
       * See .command() for creating an attached subcommand which inherits settings from its parent.
       *
       * @param {Command} cmd - new subcommand
       * @param {object} [opts] - configuration options
       * @return {Command} `this` command for chaining
       */
      addCommand(cmd, opts) {
        if (!cmd._name) {
          throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
        }
        opts = opts || {};
        if (opts.isDefault) this._defaultCommandName = cmd._name;
        if (opts.noHelp || opts.hidden) cmd._hidden = true;
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd._checkForBrokenPassThrough();
        return this;
      }
      /**
       * Factory routine to create a new unattached argument.
       *
       * See .argument() for creating an attached argument, which uses this routine to
       * create the argument. You can override createArgument to return a custom argument.
       *
       * @param {string} name
       * @param {string} [description]
       * @return {Argument} new argument
       */
      createArgument(name, description) {
        return new Argument2(name, description);
      }
      /**
       * Define argument syntax for command.
       *
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @example
       * program.argument('<input-file>');
       * program.argument('[output-file]');
       *
       * @param {string} name
       * @param {string} [description]
       * @param {(Function|*)} [fn] - custom argument processing function
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      argument(name, description, fn, defaultValue) {
        const argument = this.createArgument(name, description);
        if (typeof fn === "function") {
          argument.default(defaultValue).argParser(fn);
        } else {
          argument.default(fn);
        }
        this.addArgument(argument);
        return this;
      }
      /**
       * Define argument syntax for command, adding multiple at once (without descriptions).
       *
       * See also .argument().
       *
       * @example
       * program.arguments('<cmd> [env]');
       *
       * @param {string} names
       * @return {Command} `this` command for chaining
       */
      arguments(names) {
        names.trim().split(/ +/).forEach((detail) => {
          this.argument(detail);
        });
        return this;
      }
      /**
       * Define argument syntax for command, adding a prepared argument.
       *
       * @param {Argument} argument
       * @return {Command} `this` command for chaining
       */
      addArgument(argument) {
        const previousArgument = this.registeredArguments.slice(-1)[0];
        if (previousArgument && previousArgument.variadic) {
          throw new Error(
            `only the last argument can be variadic '${previousArgument.name()}'`
          );
        }
        if (argument.required && argument.defaultValue !== void 0 && argument.parseArg === void 0) {
          throw new Error(
            `a default value for a required argument is never used: '${argument.name()}'`
          );
        }
        this.registeredArguments.push(argument);
        return this;
      }
      /**
       * Customise or override default help command. By default a help command is automatically added if your command has subcommands.
       *
       * @example
       *    program.helpCommand('help [cmd]');
       *    program.helpCommand('help [cmd]', 'show help');
       *    program.helpCommand(false); // suppress default help command
       *    program.helpCommand(true); // add help command even if no subcommands
       *
       * @param {string|boolean} enableOrNameAndArgs - enable with custom name and/or arguments, or boolean to override whether added
       * @param {string} [description] - custom description
       * @return {Command} `this` command for chaining
       */
      helpCommand(enableOrNameAndArgs, description) {
        if (typeof enableOrNameAndArgs === "boolean") {
          this._addImplicitHelpCommand = enableOrNameAndArgs;
          return this;
        }
        enableOrNameAndArgs = enableOrNameAndArgs ?? "help [command]";
        const [, helpName, helpArgs] = enableOrNameAndArgs.match(/([^ ]+) *(.*)/);
        const helpDescription = description ?? "display help for command";
        const helpCommand = this.createCommand(helpName);
        helpCommand.helpOption(false);
        if (helpArgs) helpCommand.arguments(helpArgs);
        if (helpDescription) helpCommand.description(helpDescription);
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        return this;
      }
      /**
       * Add prepared custom help command.
       *
       * @param {(Command|string|boolean)} helpCommand - custom help command, or deprecated enableOrNameAndArgs as for `.helpCommand()`
       * @param {string} [deprecatedDescription] - deprecated custom description used with custom name only
       * @return {Command} `this` command for chaining
       */
      addHelpCommand(helpCommand, deprecatedDescription) {
        if (typeof helpCommand !== "object") {
          this.helpCommand(helpCommand, deprecatedDescription);
          return this;
        }
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        return this;
      }
      /**
       * Lazy create help command.
       *
       * @return {(Command|null)}
       * @package
       */
      _getHelpCommand() {
        const hasImplicitHelpCommand = this._addImplicitHelpCommand ?? (this.commands.length && !this._actionHandler && !this._findCommand("help"));
        if (hasImplicitHelpCommand) {
          if (this._helpCommand === void 0) {
            this.helpCommand(void 0, void 0);
          }
          return this._helpCommand;
        }
        return null;
      }
      /**
       * Add hook for life cycle event.
       *
       * @param {string} event
       * @param {Function} listener
       * @return {Command} `this` command for chaining
       */
      hook(event, listener) {
        const allowedValues = ["preSubcommand", "preAction", "postAction"];
        if (!allowedValues.includes(event)) {
          throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        if (this._lifeCycleHooks[event]) {
          this._lifeCycleHooks[event].push(listener);
        } else {
          this._lifeCycleHooks[event] = [listener];
        }
        return this;
      }
      /**
       * Register callback to use as replacement for calling process.exit.
       *
       * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
       * @return {Command} `this` command for chaining
       */
      exitOverride(fn) {
        if (fn) {
          this._exitCallback = fn;
        } else {
          this._exitCallback = (err) => {
            if (err.code !== "commander.executeSubCommandAsync") {
              throw err;
            } else {
            }
          };
        }
        return this;
      }
      /**
       * Call process.exit, and _exitCallback if defined.
       *
       * @param {number} exitCode exit code for using with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       * @return never
       * @private
       */
      _exit(exitCode, code, message) {
        if (this._exitCallback) {
          this._exitCallback(new CommanderError2(exitCode, code, message));
        }
        process2.exit(exitCode);
      }
      /**
       * Register callback `fn` for the command.
       *
       * @example
       * program
       *   .command('serve')
       *   .description('start service')
       *   .action(function() {
       *      // do work here
       *   });
       *
       * @param {Function} fn
       * @return {Command} `this` command for chaining
       */
      action(fn) {
        const listener = (args) => {
          const expectedArgsCount = this.registeredArguments.length;
          const actionArgs = args.slice(0, expectedArgsCount);
          if (this._storeOptionsAsProperties) {
            actionArgs[expectedArgsCount] = this;
          } else {
            actionArgs[expectedArgsCount] = this.opts();
          }
          actionArgs.push(this);
          return fn.apply(this, actionArgs);
        };
        this._actionHandler = listener;
        return this;
      }
      /**
       * Factory routine to create a new unattached option.
       *
       * See .option() for creating an attached option, which uses this routine to
       * create the option. You can override createOption to return a custom option.
       *
       * @param {string} flags
       * @param {string} [description]
       * @return {Option} new option
       */
      createOption(flags, description) {
        return new Option2(flags, description);
      }
      /**
       * Wrap parseArgs to catch 'commander.invalidArgument'.
       *
       * @param {(Option | Argument)} target
       * @param {string} value
       * @param {*} previous
       * @param {string} invalidArgumentMessage
       * @private
       */
      _callParseArg(target, value, previous, invalidArgumentMessage) {
        try {
          return target.parseArg(value, previous);
        } catch (err) {
          if (err.code === "commander.invalidArgument") {
            const message = `${invalidArgumentMessage} ${err.message}`;
            this.error(message, { exitCode: err.exitCode, code: err.code });
          }
          throw err;
        }
      }
      /**
       * Check for option flag conflicts.
       * Register option if no conflicts found, or throw on conflict.
       *
       * @param {Option} option
       * @private
       */
      _registerOption(option) {
        const matchingOption = option.short && this._findOption(option.short) || option.long && this._findOption(option.long);
        if (matchingOption) {
          const matchingFlag = option.long && this._findOption(option.long) ? option.long : option.short;
          throw new Error(`Cannot add option '${option.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${matchingFlag}'
-  already used by option '${matchingOption.flags}'`);
        }
        this.options.push(option);
      }
      /**
       * Check for command name and alias conflicts with existing commands.
       * Register command if no conflicts found, or throw on conflict.
       *
       * @param {Command} command
       * @private
       */
      _registerCommand(command) {
        const knownBy = (cmd) => {
          return [cmd.name()].concat(cmd.aliases());
        };
        const alreadyUsed = knownBy(command).find(
          (name) => this._findCommand(name)
        );
        if (alreadyUsed) {
          const existingCmd = knownBy(this._findCommand(alreadyUsed)).join("|");
          const newCmd = knownBy(command).join("|");
          throw new Error(
            `cannot add command '${newCmd}' as already have command '${existingCmd}'`
          );
        }
        this.commands.push(command);
      }
      /**
       * Add an option.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addOption(option) {
        this._registerOption(option);
        const oname = option.name();
        const name = option.attributeName();
        if (option.negate) {
          const positiveLongFlag = option.long.replace(/^--no-/, "--");
          if (!this._findOption(positiveLongFlag)) {
            this.setOptionValueWithSource(
              name,
              option.defaultValue === void 0 ? true : option.defaultValue,
              "default"
            );
          }
        } else if (option.defaultValue !== void 0) {
          this.setOptionValueWithSource(name, option.defaultValue, "default");
        }
        const handleOptionValue = (val, invalidValueMessage, valueSource) => {
          if (val == null && option.presetArg !== void 0) {
            val = option.presetArg;
          }
          const oldValue = this.getOptionValue(name);
          if (val !== null && option.parseArg) {
            val = this._callParseArg(option, val, oldValue, invalidValueMessage);
          } else if (val !== null && option.variadic) {
            val = option._concatValue(val, oldValue);
          }
          if (val == null) {
            if (option.negate) {
              val = false;
            } else if (option.isBoolean() || option.optional) {
              val = true;
            } else {
              val = "";
            }
          }
          this.setOptionValueWithSource(name, val, valueSource);
        };
        this.on("option:" + oname, (val) => {
          const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
          handleOptionValue(val, invalidValueMessage, "cli");
        });
        if (option.envVar) {
          this.on("optionEnv:" + oname, (val) => {
            const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
            handleOptionValue(val, invalidValueMessage, "env");
          });
        }
        return this;
      }
      /**
       * Internal implementation shared by .option() and .requiredOption()
       *
       * @return {Command} `this` command for chaining
       * @private
       */
      _optionEx(config, flags, description, fn, defaultValue) {
        if (typeof flags === "object" && flags instanceof Option2) {
          throw new Error(
            "To add an Option object use addOption() instead of option() or requiredOption()"
          );
        }
        const option = this.createOption(flags, description);
        option.makeOptionMandatory(!!config.mandatory);
        if (typeof fn === "function") {
          option.default(defaultValue).argParser(fn);
        } else if (fn instanceof RegExp) {
          const regex = fn;
          fn = (val, def) => {
            const m = regex.exec(val);
            return m ? m[0] : def;
          };
          option.default(defaultValue).argParser(fn);
        } else {
          option.default(fn);
        }
        return this.addOption(option);
      }
      /**
       * Define option with `flags`, `description`, and optional argument parsing function or `defaultValue` or both.
       *
       * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space. A required
       * option-argument is indicated by `<>` and an optional option-argument by `[]`.
       *
       * See the README for more details, and see also addOption() and requiredOption().
       *
       * @example
       * program
       *     .option('-p, --pepper', 'add pepper')
       *     .option('--pt, --pizza-type <TYPE>', 'type of pizza') // required option-argument
       *     .option('-c, --cheese [CHEESE]', 'add extra cheese', 'mozzarella') // optional option-argument with default
       *     .option('-t, --tip <VALUE>', 'add tip to purchase cost', parseFloat) // custom parse function
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      option(flags, description, parseArg, defaultValue) {
        return this._optionEx({}, flags, description, parseArg, defaultValue);
      }
      /**
       * Add a required option which must have a value after parsing. This usually means
       * the option must be specified on the command line. (Otherwise the same as .option().)
       *
       * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      requiredOption(flags, description, parseArg, defaultValue) {
        return this._optionEx(
          { mandatory: true },
          flags,
          description,
          parseArg,
          defaultValue
        );
      }
      /**
       * Alter parsing of short flags with optional values.
       *
       * @example
       * // for `.option('-f,--flag [value]'):
       * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
       * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
       *
       * @param {boolean} [combine] - if `true` or omitted, an optional value can be specified directly after the flag.
       * @return {Command} `this` command for chaining
       */
      combineFlagAndOptionalValue(combine = true) {
        this._combineFlagAndOptionalValue = !!combine;
        return this;
      }
      /**
       * Allow unknown options on the command line.
       *
       * @param {boolean} [allowUnknown] - if `true` or omitted, no error will be thrown for unknown options.
       * @return {Command} `this` command for chaining
       */
      allowUnknownOption(allowUnknown = true) {
        this._allowUnknownOption = !!allowUnknown;
        return this;
      }
      /**
       * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
       *
       * @param {boolean} [allowExcess] - if `true` or omitted, no error will be thrown for excess arguments.
       * @return {Command} `this` command for chaining
       */
      allowExcessArguments(allowExcess = true) {
        this._allowExcessArguments = !!allowExcess;
        return this;
      }
      /**
       * Enable positional options. Positional means global options are specified before subcommands which lets
       * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
       * The default behaviour is non-positional and global options may appear anywhere on the command line.
       *
       * @param {boolean} [positional]
       * @return {Command} `this` command for chaining
       */
      enablePositionalOptions(positional = true) {
        this._enablePositionalOptions = !!positional;
        return this;
      }
      /**
       * Pass through options that come after command-arguments rather than treat them as command-options,
       * so actual command-options come before command-arguments. Turning this on for a subcommand requires
       * positional options to have been enabled on the program (parent commands).
       * The default behaviour is non-positional and options may appear before or after command-arguments.
       *
       * @param {boolean} [passThrough] for unknown options.
       * @return {Command} `this` command for chaining
       */
      passThroughOptions(passThrough = true) {
        this._passThroughOptions = !!passThrough;
        this._checkForBrokenPassThrough();
        return this;
      }
      /**
       * @private
       */
      _checkForBrokenPassThrough() {
        if (this.parent && this._passThroughOptions && !this.parent._enablePositionalOptions) {
          throw new Error(
            `passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`
          );
        }
      }
      /**
       * Whether to store option values as properties on command object,
       * or store separately (specify false). In both cases the option values can be accessed using .opts().
       *
       * @param {boolean} [storeAsProperties=true]
       * @return {Command} `this` command for chaining
       */
      storeOptionsAsProperties(storeAsProperties = true) {
        if (this.options.length) {
          throw new Error("call .storeOptionsAsProperties() before adding options");
        }
        if (Object.keys(this._optionValues).length) {
          throw new Error(
            "call .storeOptionsAsProperties() before setting option values"
          );
        }
        this._storeOptionsAsProperties = !!storeAsProperties;
        return this;
      }
      /**
       * Retrieve option value.
       *
       * @param {string} key
       * @return {object} value
       */
      getOptionValue(key) {
        if (this._storeOptionsAsProperties) {
          return this[key];
        }
        return this._optionValues[key];
      }
      /**
       * Store option value.
       *
       * @param {string} key
       * @param {object} value
       * @return {Command} `this` command for chaining
       */
      setOptionValue(key, value) {
        return this.setOptionValueWithSource(key, value, void 0);
      }
      /**
       * Store option value and where the value came from.
       *
       * @param {string} key
       * @param {object} value
       * @param {string} source - expected values are default/config/env/cli/implied
       * @return {Command} `this` command for chaining
       */
      setOptionValueWithSource(key, value, source) {
        if (this._storeOptionsAsProperties) {
          this[key] = value;
        } else {
          this._optionValues[key] = value;
        }
        this._optionValueSources[key] = source;
        return this;
      }
      /**
       * Get source of option value.
       * Expected values are default | config | env | cli | implied
       *
       * @param {string} key
       * @return {string}
       */
      getOptionValueSource(key) {
        return this._optionValueSources[key];
      }
      /**
       * Get source of option value. See also .optsWithGlobals().
       * Expected values are default | config | env | cli | implied
       *
       * @param {string} key
       * @return {string}
       */
      getOptionValueSourceWithGlobals(key) {
        let source;
        this._getCommandAndAncestors().forEach((cmd) => {
          if (cmd.getOptionValueSource(key) !== void 0) {
            source = cmd.getOptionValueSource(key);
          }
        });
        return source;
      }
      /**
       * Get user arguments from implied or explicit arguments.
       * Side-effects: set _scriptPath if args included script. Used for default program name, and subcommand searches.
       *
       * @private
       */
      _prepareUserArgs(argv, parseOptions2) {
        if (argv !== void 0 && !Array.isArray(argv)) {
          throw new Error("first parameter to parse must be array or undefined");
        }
        parseOptions2 = parseOptions2 || {};
        if (argv === void 0 && parseOptions2.from === void 0) {
          if (process2.versions?.electron) {
            parseOptions2.from = "electron";
          }
          const execArgv = process2.execArgv ?? [];
          if (execArgv.includes("-e") || execArgv.includes("--eval") || execArgv.includes("-p") || execArgv.includes("--print")) {
            parseOptions2.from = "eval";
          }
        }
        if (argv === void 0) {
          argv = process2.argv;
        }
        this.rawArgs = argv.slice();
        let userArgs;
        switch (parseOptions2.from) {
          case void 0:
          case "node":
            this._scriptPath = argv[1];
            userArgs = argv.slice(2);
            break;
          case "electron":
            if (process2.defaultApp) {
              this._scriptPath = argv[1];
              userArgs = argv.slice(2);
            } else {
              userArgs = argv.slice(1);
            }
            break;
          case "user":
            userArgs = argv.slice(0);
            break;
          case "eval":
            userArgs = argv.slice(1);
            break;
          default:
            throw new Error(
              `unexpected parse option { from: '${parseOptions2.from}' }`
            );
        }
        if (!this._name && this._scriptPath)
          this.nameFromFilename(this._scriptPath);
        this._name = this._name || "program";
        return userArgs;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Use parseAsync instead of parse if any of your action handlers are async.
       *
       * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
       *
       * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
       * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
       * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
       * - `'user'`: just user arguments
       *
       * @example
       * program.parse(); // parse process.argv and auto-detect electron and special node flags
       * program.parse(process.argv); // assume argv[0] is app and argv[1] is script
       * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv] - optional, defaults to process.argv
       * @param {object} [parseOptions] - optionally specify style of options with from: node/user/electron
       * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
       * @return {Command} `this` command for chaining
       */
      parse(argv, parseOptions2) {
        this._prepareForParse();
        const userArgs = this._prepareUserArgs(argv, parseOptions2);
        this._parseCommand([], userArgs);
        return this;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
       *
       * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
       * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
       * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
       * - `'user'`: just user arguments
       *
       * @example
       * await program.parseAsync(); // parse process.argv and auto-detect electron and special node flags
       * await program.parseAsync(process.argv); // assume argv[0] is app and argv[1] is script
       * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv]
       * @param {object} [parseOptions]
       * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
       * @return {Promise}
       */
      async parseAsync(argv, parseOptions2) {
        this._prepareForParse();
        const userArgs = this._prepareUserArgs(argv, parseOptions2);
        await this._parseCommand([], userArgs);
        return this;
      }
      _prepareForParse() {
        if (this._savedState === null) {
          this.saveStateBeforeParse();
        } else {
          this.restoreStateBeforeParse();
        }
      }
      /**
       * Called the first time parse is called to save state and allow a restore before subsequent calls to parse.
       * Not usually called directly, but available for subclasses to save their custom state.
       *
       * This is called in a lazy way. Only commands used in parsing chain will have state saved.
       */
      saveStateBeforeParse() {
        this._savedState = {
          // name is stable if supplied by author, but may be unspecified for root command and deduced during parsing
          _name: this._name,
          // option values before parse have default values (including false for negated options)
          // shallow clones
          _optionValues: { ...this._optionValues },
          _optionValueSources: { ...this._optionValueSources }
        };
      }
      /**
       * Restore state before parse for calls after the first.
       * Not usually called directly, but available for subclasses to save their custom state.
       *
       * This is called in a lazy way. Only commands used in parsing chain will have state restored.
       */
      restoreStateBeforeParse() {
        if (this._storeOptionsAsProperties)
          throw new Error(`Can not call parse again when storeOptionsAsProperties is true.
- either make a new Command for each call to parse, or stop storing options as properties`);
        this._name = this._savedState._name;
        this._scriptPath = null;
        this.rawArgs = [];
        this._optionValues = { ...this._savedState._optionValues };
        this._optionValueSources = { ...this._savedState._optionValueSources };
        this.args = [];
        this.processedArgs = [];
      }
      /**
       * Throw if expected executable is missing. Add lots of help for author.
       *
       * @param {string} executableFile
       * @param {string} executableDir
       * @param {string} subcommandName
       */
      _checkForMissingExecutable(executableFile, executableDir, subcommandName) {
        if (fs.existsSync(executableFile)) return;
        const executableDirMessage = executableDir ? `searched for local subcommand relative to directory '${executableDir}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory";
        const executableMissing = `'${executableFile}' does not exist
 - if '${subcommandName}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
        throw new Error(executableMissing);
      }
      /**
       * Execute a sub-command executable.
       *
       * @private
       */
      _executeSubCommand(subcommand, args) {
        args = args.slice();
        let launchWithNode = false;
        const sourceExt = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
        function findFile(baseDir, baseName) {
          const localBin = path2.resolve(baseDir, baseName);
          if (fs.existsSync(localBin)) return localBin;
          if (sourceExt.includes(path2.extname(baseName))) return void 0;
          const foundExt = sourceExt.find(
            (ext) => fs.existsSync(`${localBin}${ext}`)
          );
          if (foundExt) return `${localBin}${foundExt}`;
          return void 0;
        }
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        let executableFile = subcommand._executableFile || `${this._name}-${subcommand._name}`;
        let executableDir = this._executableDir || "";
        if (this._scriptPath) {
          let resolvedScriptPath;
          try {
            resolvedScriptPath = fs.realpathSync(this._scriptPath);
          } catch {
            resolvedScriptPath = this._scriptPath;
          }
          executableDir = path2.resolve(
            path2.dirname(resolvedScriptPath),
            executableDir
          );
        }
        if (executableDir) {
          let localFile = findFile(executableDir, executableFile);
          if (!localFile && !subcommand._executableFile && this._scriptPath) {
            const legacyName = path2.basename(
              this._scriptPath,
              path2.extname(this._scriptPath)
            );
            if (legacyName !== this._name) {
              localFile = findFile(
                executableDir,
                `${legacyName}-${subcommand._name}`
              );
            }
          }
          executableFile = localFile || executableFile;
        }
        launchWithNode = sourceExt.includes(path2.extname(executableFile));
        let proc;
        if (process2.platform !== "win32") {
          if (launchWithNode) {
            args.unshift(executableFile);
            args = incrementNodeInspectorPort(process2.execArgv).concat(args);
            proc = childProcess.spawn(process2.argv[0], args, { stdio: "inherit" });
          } else {
            proc = childProcess.spawn(executableFile, args, { stdio: "inherit" });
          }
        } else {
          this._checkForMissingExecutable(
            executableFile,
            executableDir,
            subcommand._name
          );
          args.unshift(executableFile);
          args = incrementNodeInspectorPort(process2.execArgv).concat(args);
          proc = childProcess.spawn(process2.execPath, args, { stdio: "inherit" });
        }
        if (!proc.killed) {
          const signals = ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"];
          signals.forEach((signal) => {
            process2.on(signal, () => {
              if (proc.killed === false && proc.exitCode === null) {
                proc.kill(signal);
              }
            });
          });
        }
        const exitCallback = this._exitCallback;
        proc.on("close", (code) => {
          code = code ?? 1;
          if (!exitCallback) {
            process2.exit(code);
          } else {
            exitCallback(
              new CommanderError2(
                code,
                "commander.executeSubCommandAsync",
                "(close)"
              )
            );
          }
        });
        proc.on("error", (err) => {
          if (err.code === "ENOENT") {
            this._checkForMissingExecutable(
              executableFile,
              executableDir,
              subcommand._name
            );
          } else if (err.code === "EACCES") {
            throw new Error(`'${executableFile}' not executable`);
          }
          if (!exitCallback) {
            process2.exit(1);
          } else {
            const wrappedError = new CommanderError2(
              1,
              "commander.executeSubCommandAsync",
              "(error)"
            );
            wrappedError.nestedError = err;
            exitCallback(wrappedError);
          }
        });
        this.runningCommand = proc;
      }
      /**
       * @private
       */
      _dispatchSubcommand(commandName, operands, unknown) {
        const subCommand = this._findCommand(commandName);
        if (!subCommand) this.help({ error: true });
        subCommand._prepareForParse();
        let promiseChain;
        promiseChain = this._chainOrCallSubCommandHook(
          promiseChain,
          subCommand,
          "preSubcommand"
        );
        promiseChain = this._chainOrCall(promiseChain, () => {
          if (subCommand._executableHandler) {
            this._executeSubCommand(subCommand, operands.concat(unknown));
          } else {
            return subCommand._parseCommand(operands, unknown);
          }
        });
        return promiseChain;
      }
      /**
       * Invoke help directly if possible, or dispatch if necessary.
       * e.g. help foo
       *
       * @private
       */
      _dispatchHelpCommand(subcommandName) {
        if (!subcommandName) {
          this.help();
        }
        const subCommand = this._findCommand(subcommandName);
        if (subCommand && !subCommand._executableHandler) {
          subCommand.help();
        }
        return this._dispatchSubcommand(
          subcommandName,
          [],
          [this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? "--help"]
        );
      }
      /**
       * Check this.args against expected this.registeredArguments.
       *
       * @private
       */
      _checkNumberOfArguments() {
        this.registeredArguments.forEach((arg, i) => {
          if (arg.required && this.args[i] == null) {
            this.missingArgument(arg.name());
          }
        });
        if (this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic) {
          return;
        }
        if (this.args.length > this.registeredArguments.length) {
          this._excessArguments(this.args);
        }
      }
      /**
       * Process this.args using this.registeredArguments and save as this.processedArgs!
       *
       * @private
       */
      _processArguments() {
        const myParseArg = (argument, value, previous) => {
          let parsedValue = value;
          if (value !== null && argument.parseArg) {
            const invalidValueMessage = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'.`;
            parsedValue = this._callParseArg(
              argument,
              value,
              previous,
              invalidValueMessage
            );
          }
          return parsedValue;
        };
        this._checkNumberOfArguments();
        const processedArgs = [];
        this.registeredArguments.forEach((declaredArg, index) => {
          let value = declaredArg.defaultValue;
          if (declaredArg.variadic) {
            if (index < this.args.length) {
              value = this.args.slice(index);
              if (declaredArg.parseArg) {
                value = value.reduce((processed, v) => {
                  return myParseArg(declaredArg, v, processed);
                }, declaredArg.defaultValue);
              }
            } else if (value === void 0) {
              value = [];
            }
          } else if (index < this.args.length) {
            value = this.args[index];
            if (declaredArg.parseArg) {
              value = myParseArg(declaredArg, value, declaredArg.defaultValue);
            }
          }
          processedArgs[index] = value;
        });
        this.processedArgs = processedArgs;
      }
      /**
       * Once we have a promise we chain, but call synchronously until then.
       *
       * @param {(Promise|undefined)} promise
       * @param {Function} fn
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCall(promise, fn) {
        if (promise && promise.then && typeof promise.then === "function") {
          return promise.then(() => fn());
        }
        return fn();
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallHooks(promise, event) {
        let result = promise;
        const hooks = [];
        this._getCommandAndAncestors().reverse().filter((cmd) => cmd._lifeCycleHooks[event] !== void 0).forEach((hookedCommand) => {
          hookedCommand._lifeCycleHooks[event].forEach((callback) => {
            hooks.push({ hookedCommand, callback });
          });
        });
        if (event === "postAction") {
          hooks.reverse();
        }
        hooks.forEach((hookDetail) => {
          result = this._chainOrCall(result, () => {
            return hookDetail.callback(hookDetail.hookedCommand, this);
          });
        });
        return result;
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {Command} subCommand
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallSubCommandHook(promise, subCommand, event) {
        let result = promise;
        if (this._lifeCycleHooks[event] !== void 0) {
          this._lifeCycleHooks[event].forEach((hook) => {
            result = this._chainOrCall(result, () => {
              return hook(this, subCommand);
            });
          });
        }
        return result;
      }
      /**
       * Process arguments in context of this command.
       * Returns action result, in case it is a promise.
       *
       * @private
       */
      _parseCommand(operands, unknown) {
        const parsed = this.parseOptions(unknown);
        this._parseOptionsEnv();
        this._parseOptionsImplied();
        operands = operands.concat(parsed.operands);
        unknown = parsed.unknown;
        this.args = operands.concat(unknown);
        if (operands && this._findCommand(operands[0])) {
          return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
        }
        if (this._getHelpCommand() && operands[0] === this._getHelpCommand().name()) {
          return this._dispatchHelpCommand(operands[1]);
        }
        if (this._defaultCommandName) {
          this._outputHelpIfRequested(unknown);
          return this._dispatchSubcommand(
            this._defaultCommandName,
            operands,
            unknown
          );
        }
        if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
          this.help({ error: true });
        }
        this._outputHelpIfRequested(parsed.unknown);
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        const checkForUnknownOptions = () => {
          if (parsed.unknown.length > 0) {
            this.unknownOption(parsed.unknown[0]);
          }
        };
        const commandEvent = `command:${this.name()}`;
        if (this._actionHandler) {
          checkForUnknownOptions();
          this._processArguments();
          let promiseChain;
          promiseChain = this._chainOrCallHooks(promiseChain, "preAction");
          promiseChain = this._chainOrCall(
            promiseChain,
            () => this._actionHandler(this.processedArgs)
          );
          if (this.parent) {
            promiseChain = this._chainOrCall(promiseChain, () => {
              this.parent.emit(commandEvent, operands, unknown);
            });
          }
          promiseChain = this._chainOrCallHooks(promiseChain, "postAction");
          return promiseChain;
        }
        if (this.parent && this.parent.listenerCount(commandEvent)) {
          checkForUnknownOptions();
          this._processArguments();
          this.parent.emit(commandEvent, operands, unknown);
        } else if (operands.length) {
          if (this._findCommand("*")) {
            return this._dispatchSubcommand("*", operands, unknown);
          }
          if (this.listenerCount("command:*")) {
            this.emit("command:*", operands, unknown);
          } else if (this.commands.length) {
            this.unknownCommand();
          } else {
            checkForUnknownOptions();
            this._processArguments();
          }
        } else if (this.commands.length) {
          checkForUnknownOptions();
          this.help({ error: true });
        } else {
          checkForUnknownOptions();
          this._processArguments();
        }
      }
      /**
       * Find matching command.
       *
       * @private
       * @return {Command | undefined}
       */
      _findCommand(name) {
        if (!name) return void 0;
        return this.commands.find(
          (cmd) => cmd._name === name || cmd._aliases.includes(name)
        );
      }
      /**
       * Return an option matching `arg` if any.
       *
       * @param {string} arg
       * @return {Option}
       * @package
       */
      _findOption(arg) {
        return this.options.find((option) => option.is(arg));
      }
      /**
       * Display an error message if a mandatory option does not have a value.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForMissingMandatoryOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd.options.forEach((anOption) => {
            if (anOption.mandatory && cmd.getOptionValue(anOption.attributeName()) === void 0) {
              cmd.missingMandatoryOptionValue(anOption);
            }
          });
        });
      }
      /**
       * Display an error message if conflicting options are used together in this.
       *
       * @private
       */
      _checkForConflictingLocalOptions() {
        const definedNonDefaultOptions = this.options.filter((option) => {
          const optionKey = option.attributeName();
          if (this.getOptionValue(optionKey) === void 0) {
            return false;
          }
          return this.getOptionValueSource(optionKey) !== "default";
        });
        const optionsWithConflicting = definedNonDefaultOptions.filter(
          (option) => option.conflictsWith.length > 0
        );
        optionsWithConflicting.forEach((option) => {
          const conflictingAndDefined = definedNonDefaultOptions.find(
            (defined) => option.conflictsWith.includes(defined.attributeName())
          );
          if (conflictingAndDefined) {
            this._conflictingOption(option, conflictingAndDefined);
          }
        });
      }
      /**
       * Display an error message if conflicting options are used together.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForConflictingOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd._checkForConflictingLocalOptions();
        });
      }
      /**
       * Parse options from `argv` removing known options,
       * and return argv split into operands and unknown arguments.
       *
       * Side effects: modifies command by storing options. Does not reset state if called again.
       *
       * Examples:
       *
       *     argv => operands, unknown
       *     --known kkk op => [op], []
       *     op --known kkk => [op], []
       *     sub --unknown uuu op => [sub], [--unknown uuu op]
       *     sub -- --unknown uuu op => [sub --unknown uuu op], []
       *
       * @param {string[]} argv
       * @return {{operands: string[], unknown: string[]}}
       */
      parseOptions(argv) {
        const operands = [];
        const unknown = [];
        let dest = operands;
        const args = argv.slice();
        function maybeOption(arg) {
          return arg.length > 1 && arg[0] === "-";
        }
        let activeVariadicOption = null;
        while (args.length) {
          const arg = args.shift();
          if (arg === "--") {
            if (dest === unknown) dest.push(arg);
            dest.push(...args);
            break;
          }
          if (activeVariadicOption && !maybeOption(arg)) {
            this.emit(`option:${activeVariadicOption.name()}`, arg);
            continue;
          }
          activeVariadicOption = null;
          if (maybeOption(arg)) {
            const option = this._findOption(arg);
            if (option) {
              if (option.required) {
                const value = args.shift();
                if (value === void 0) this.optionMissingArgument(option);
                this.emit(`option:${option.name()}`, value);
              } else if (option.optional) {
                let value = null;
                if (args.length > 0 && !maybeOption(args[0])) {
                  value = args.shift();
                }
                this.emit(`option:${option.name()}`, value);
              } else {
                this.emit(`option:${option.name()}`);
              }
              activeVariadicOption = option.variadic ? option : null;
              continue;
            }
          }
          if (arg.length > 2 && arg[0] === "-" && arg[1] !== "-") {
            const option = this._findOption(`-${arg[1]}`);
            if (option) {
              if (option.required || option.optional && this._combineFlagAndOptionalValue) {
                this.emit(`option:${option.name()}`, arg.slice(2));
              } else {
                this.emit(`option:${option.name()}`);
                args.unshift(`-${arg.slice(2)}`);
              }
              continue;
            }
          }
          if (/^--[^=]+=/.test(arg)) {
            const index = arg.indexOf("=");
            const option = this._findOption(arg.slice(0, index));
            if (option && (option.required || option.optional)) {
              this.emit(`option:${option.name()}`, arg.slice(index + 1));
              continue;
            }
          }
          if (maybeOption(arg)) {
            dest = unknown;
          }
          if ((this._enablePositionalOptions || this._passThroughOptions) && operands.length === 0 && unknown.length === 0) {
            if (this._findCommand(arg)) {
              operands.push(arg);
              if (args.length > 0) unknown.push(...args);
              break;
            } else if (this._getHelpCommand() && arg === this._getHelpCommand().name()) {
              operands.push(arg);
              if (args.length > 0) operands.push(...args);
              break;
            } else if (this._defaultCommandName) {
              unknown.push(arg);
              if (args.length > 0) unknown.push(...args);
              break;
            }
          }
          if (this._passThroughOptions) {
            dest.push(arg);
            if (args.length > 0) dest.push(...args);
            break;
          }
          dest.push(arg);
        }
        return { operands, unknown };
      }
      /**
       * Return an object containing local option values as key-value pairs.
       *
       * @return {object}
       */
      opts() {
        if (this._storeOptionsAsProperties) {
          const result = {};
          const len = this.options.length;
          for (let i = 0; i < len; i++) {
            const key = this.options[i].attributeName();
            result[key] = key === this._versionOptionName ? this._version : this[key];
          }
          return result;
        }
        return this._optionValues;
      }
      /**
       * Return an object containing merged local and global option values as key-value pairs.
       *
       * @return {object}
       */
      optsWithGlobals() {
        return this._getCommandAndAncestors().reduce(
          (combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()),
          {}
        );
      }
      /**
       * Display error message and exit (or call exitOverride).
       *
       * @param {string} message
       * @param {object} [errorOptions]
       * @param {string} [errorOptions.code] - an id string representing the error
       * @param {number} [errorOptions.exitCode] - used with process.exit
       */
      error(message, errorOptions) {
        this._outputConfiguration.outputError(
          `${message}
`,
          this._outputConfiguration.writeErr
        );
        if (typeof this._showHelpAfterError === "string") {
          this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`);
        } else if (this._showHelpAfterError) {
          this._outputConfiguration.writeErr("\n");
          this.outputHelp({ error: true });
        }
        const config = errorOptions || {};
        const exitCode = config.exitCode || 1;
        const code = config.code || "commander.error";
        this._exit(exitCode, code, message);
      }
      /**
       * Apply any option related environment variables, if option does
       * not have a value from cli or client code.
       *
       * @private
       */
      _parseOptionsEnv() {
        this.options.forEach((option) => {
          if (option.envVar && option.envVar in process2.env) {
            const optionKey = option.attributeName();
            if (this.getOptionValue(optionKey) === void 0 || ["default", "config", "env"].includes(
              this.getOptionValueSource(optionKey)
            )) {
              if (option.required || option.optional) {
                this.emit(`optionEnv:${option.name()}`, process2.env[option.envVar]);
              } else {
                this.emit(`optionEnv:${option.name()}`);
              }
            }
          }
        });
      }
      /**
       * Apply any implied option values, if option is undefined or default value.
       *
       * @private
       */
      _parseOptionsImplied() {
        const dualHelper = new DualOptions(this.options);
        const hasCustomOptionValue = (optionKey) => {
          return this.getOptionValue(optionKey) !== void 0 && !["default", "implied"].includes(this.getOptionValueSource(optionKey));
        };
        this.options.filter(
          (option) => option.implied !== void 0 && hasCustomOptionValue(option.attributeName()) && dualHelper.valueFromOption(
            this.getOptionValue(option.attributeName()),
            option
          )
        ).forEach((option) => {
          Object.keys(option.implied).filter((impliedKey) => !hasCustomOptionValue(impliedKey)).forEach((impliedKey) => {
            this.setOptionValueWithSource(
              impliedKey,
              option.implied[impliedKey],
              "implied"
            );
          });
        });
      }
      /**
       * Argument `name` is missing.
       *
       * @param {string} name
       * @private
       */
      missingArgument(name) {
        const message = `error: missing required argument '${name}'`;
        this.error(message, { code: "commander.missingArgument" });
      }
      /**
       * `Option` is missing an argument.
       *
       * @param {Option} option
       * @private
       */
      optionMissingArgument(option) {
        const message = `error: option '${option.flags}' argument missing`;
        this.error(message, { code: "commander.optionMissingArgument" });
      }
      /**
       * `Option` does not have a value, and is a mandatory option.
       *
       * @param {Option} option
       * @private
       */
      missingMandatoryOptionValue(option) {
        const message = `error: required option '${option.flags}' not specified`;
        this.error(message, { code: "commander.missingMandatoryOptionValue" });
      }
      /**
       * `Option` conflicts with another option.
       *
       * @param {Option} option
       * @param {Option} conflictingOption
       * @private
       */
      _conflictingOption(option, conflictingOption) {
        const findBestOptionFromValue = (option2) => {
          const optionKey = option2.attributeName();
          const optionValue = this.getOptionValue(optionKey);
          const negativeOption = this.options.find(
            (target) => target.negate && optionKey === target.attributeName()
          );
          const positiveOption = this.options.find(
            (target) => !target.negate && optionKey === target.attributeName()
          );
          if (negativeOption && (negativeOption.presetArg === void 0 && optionValue === false || negativeOption.presetArg !== void 0 && optionValue === negativeOption.presetArg)) {
            return negativeOption;
          }
          return positiveOption || option2;
        };
        const getErrorMessage = (option2) => {
          const bestOption = findBestOptionFromValue(option2);
          const optionKey = bestOption.attributeName();
          const source = this.getOptionValueSource(optionKey);
          if (source === "env") {
            return `environment variable '${bestOption.envVar}'`;
          }
          return `option '${bestOption.flags}'`;
        };
        const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
        this.error(message, { code: "commander.conflictingOption" });
      }
      /**
       * Unknown option `flag`.
       *
       * @param {string} flag
       * @private
       */
      unknownOption(flag) {
        if (this._allowUnknownOption) return;
        let suggestion = "";
        if (flag.startsWith("--") && this._showSuggestionAfterError) {
          let candidateFlags = [];
          let command = this;
          do {
            const moreFlags = command.createHelp().visibleOptions(command).filter((option) => option.long).map((option) => option.long);
            candidateFlags = candidateFlags.concat(moreFlags);
            command = command.parent;
          } while (command && !command._enablePositionalOptions);
          suggestion = suggestSimilar(flag, candidateFlags);
        }
        const message = `error: unknown option '${flag}'${suggestion}`;
        this.error(message, { code: "commander.unknownOption" });
      }
      /**
       * Excess arguments, more than expected.
       *
       * @param {string[]} receivedArgs
       * @private
       */
      _excessArguments(receivedArgs) {
        if (this._allowExcessArguments) return;
        const expected = this.registeredArguments.length;
        const s = expected === 1 ? "" : "s";
        const forSubcommand = this.parent ? ` for '${this.name()}'` : "";
        const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
        this.error(message, { code: "commander.excessArguments" });
      }
      /**
       * Unknown command.
       *
       * @private
       */
      unknownCommand() {
        const unknownName = this.args[0];
        let suggestion = "";
        if (this._showSuggestionAfterError) {
          const candidateNames = [];
          this.createHelp().visibleCommands(this).forEach((command) => {
            candidateNames.push(command.name());
            if (command.alias()) candidateNames.push(command.alias());
          });
          suggestion = suggestSimilar(unknownName, candidateNames);
        }
        const message = `error: unknown command '${unknownName}'${suggestion}`;
        this.error(message, { code: "commander.unknownCommand" });
      }
      /**
       * Get or set the program version.
       *
       * This method auto-registers the "-V, --version" option which will print the version number.
       *
       * You can optionally supply the flags and description to override the defaults.
       *
       * @param {string} [str]
       * @param {string} [flags]
       * @param {string} [description]
       * @return {(this | string | undefined)} `this` command for chaining, or version string if no arguments
       */
      version(str, flags, description) {
        if (str === void 0) return this._version;
        this._version = str;
        flags = flags || "-V, --version";
        description = description || "output the version number";
        const versionOption = this.createOption(flags, description);
        this._versionOptionName = versionOption.attributeName();
        this._registerOption(versionOption);
        this.on("option:" + versionOption.name(), () => {
          this._outputConfiguration.writeOut(`${str}
`);
          this._exit(0, "commander.version", str);
        });
        return this;
      }
      /**
       * Set the description.
       *
       * @param {string} [str]
       * @param {object} [argsDescription]
       * @return {(string|Command)}
       */
      description(str, argsDescription) {
        if (str === void 0 && argsDescription === void 0)
          return this._description;
        this._description = str;
        if (argsDescription) {
          this._argsDescription = argsDescription;
        }
        return this;
      }
      /**
       * Set the summary. Used when listed as subcommand of parent.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      summary(str) {
        if (str === void 0) return this._summary;
        this._summary = str;
        return this;
      }
      /**
       * Set an alias for the command.
       *
       * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
       *
       * @param {string} [alias]
       * @return {(string|Command)}
       */
      alias(alias) {
        if (alias === void 0) return this._aliases[0];
        let command = this;
        if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
          command = this.commands[this.commands.length - 1];
        }
        if (alias === command._name)
          throw new Error("Command alias can't be the same as its name");
        const matchingCommand = this.parent?._findCommand(alias);
        if (matchingCommand) {
          const existingCmd = [matchingCommand.name()].concat(matchingCommand.aliases()).join("|");
          throw new Error(
            `cannot add alias '${alias}' to command '${this.name()}' as already have command '${existingCmd}'`
          );
        }
        command._aliases.push(alias);
        return this;
      }
      /**
       * Set aliases for the command.
       *
       * Only the first alias is shown in the auto-generated help.
       *
       * @param {string[]} [aliases]
       * @return {(string[]|Command)}
       */
      aliases(aliases) {
        if (aliases === void 0) return this._aliases;
        aliases.forEach((alias) => this.alias(alias));
        return this;
      }
      /**
       * Set / get the command usage `str`.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      usage(str) {
        if (str === void 0) {
          if (this._usage) return this._usage;
          const args = this.registeredArguments.map((arg) => {
            return humanReadableArgName(arg);
          });
          return [].concat(
            this.options.length || this._helpOption !== null ? "[options]" : [],
            this.commands.length ? "[command]" : [],
            this.registeredArguments.length ? args : []
          ).join(" ");
        }
        this._usage = str;
        return this;
      }
      /**
       * Get or set the name of the command.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      name(str) {
        if (str === void 0) return this._name;
        this._name = str;
        return this;
      }
      /**
       * Set the name of the command from script filename, such as process.argv[1],
       * or require.main.filename, or __filename.
       *
       * (Used internally and public although not documented in README.)
       *
       * @example
       * program.nameFromFilename(require.main.filename);
       *
       * @param {string} filename
       * @return {Command}
       */
      nameFromFilename(filename) {
        this._name = path2.basename(filename, path2.extname(filename));
        return this;
      }
      /**
       * Get or set the directory for searching for executable subcommands of this command.
       *
       * @example
       * program.executableDir(__dirname);
       * // or
       * program.executableDir('subcommands');
       *
       * @param {string} [path]
       * @return {(string|null|Command)}
       */
      executableDir(path3) {
        if (path3 === void 0) return this._executableDir;
        this._executableDir = path3;
        return this;
      }
      /**
       * Return program help documentation.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
       * @return {string}
       */
      helpInformation(contextOptions) {
        const helper = this.createHelp();
        const context = this._getOutputContext(contextOptions);
        helper.prepareContext({
          error: context.error,
          helpWidth: context.helpWidth,
          outputHasColors: context.hasColors
        });
        const text = helper.formatHelp(this, helper);
        if (context.hasColors) return text;
        return this._outputConfiguration.stripColor(text);
      }
      /**
       * @typedef HelpContext
       * @type {object}
       * @property {boolean} error
       * @property {number} helpWidth
       * @property {boolean} hasColors
       * @property {function} write - includes stripColor if needed
       *
       * @returns {HelpContext}
       * @private
       */
      _getOutputContext(contextOptions) {
        contextOptions = contextOptions || {};
        const error = !!contextOptions.error;
        let baseWrite;
        let hasColors;
        let helpWidth;
        if (error) {
          baseWrite = (str) => this._outputConfiguration.writeErr(str);
          hasColors = this._outputConfiguration.getErrHasColors();
          helpWidth = this._outputConfiguration.getErrHelpWidth();
        } else {
          baseWrite = (str) => this._outputConfiguration.writeOut(str);
          hasColors = this._outputConfiguration.getOutHasColors();
          helpWidth = this._outputConfiguration.getOutHelpWidth();
        }
        const write = (str) => {
          if (!hasColors) str = this._outputConfiguration.stripColor(str);
          return baseWrite(str);
        };
        return { error, write, hasColors, helpWidth };
      }
      /**
       * Output help information for this command.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      outputHelp(contextOptions) {
        let deprecatedCallback;
        if (typeof contextOptions === "function") {
          deprecatedCallback = contextOptions;
          contextOptions = void 0;
        }
        const outputContext = this._getOutputContext(contextOptions);
        const eventContext = {
          error: outputContext.error,
          write: outputContext.write,
          command: this
        };
        this._getCommandAndAncestors().reverse().forEach((command) => command.emit("beforeAllHelp", eventContext));
        this.emit("beforeHelp", eventContext);
        let helpInformation = this.helpInformation({ error: outputContext.error });
        if (deprecatedCallback) {
          helpInformation = deprecatedCallback(helpInformation);
          if (typeof helpInformation !== "string" && !Buffer.isBuffer(helpInformation)) {
            throw new Error("outputHelp callback must return a string or a Buffer");
          }
        }
        outputContext.write(helpInformation);
        if (this._getHelpOption()?.long) {
          this.emit(this._getHelpOption().long);
        }
        this.emit("afterHelp", eventContext);
        this._getCommandAndAncestors().forEach(
          (command) => command.emit("afterAllHelp", eventContext)
        );
      }
      /**
       * You can pass in flags and a description to customise the built-in help option.
       * Pass in false to disable the built-in help option.
       *
       * @example
       * program.helpOption('-?, --help' 'show help'); // customise
       * program.helpOption(false); // disable
       *
       * @param {(string | boolean)} flags
       * @param {string} [description]
       * @return {Command} `this` command for chaining
       */
      helpOption(flags, description) {
        if (typeof flags === "boolean") {
          if (flags) {
            this._helpOption = this._helpOption ?? void 0;
          } else {
            this._helpOption = null;
          }
          return this;
        }
        flags = flags ?? "-h, --help";
        description = description ?? "display help for command";
        this._helpOption = this.createOption(flags, description);
        return this;
      }
      /**
       * Lazy create help option.
       * Returns null if has been disabled with .helpOption(false).
       *
       * @returns {(Option | null)} the help option
       * @package
       */
      _getHelpOption() {
        if (this._helpOption === void 0) {
          this.helpOption(void 0, void 0);
        }
        return this._helpOption;
      }
      /**
       * Supply your own option to use for the built-in help option.
       * This is an alternative to using helpOption() to customise the flags and description etc.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addHelpOption(option) {
        this._helpOption = option;
        return this;
      }
      /**
       * Output help information and exit.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      help(contextOptions) {
        this.outputHelp(contextOptions);
        let exitCode = Number(process2.exitCode ?? 0);
        if (exitCode === 0 && contextOptions && typeof contextOptions !== "function" && contextOptions.error) {
          exitCode = 1;
        }
        this._exit(exitCode, "commander.help", "(outputHelp)");
      }
      /**
       * // Do a little typing to coordinate emit and listener for the help text events.
       * @typedef HelpTextEventContext
       * @type {object}
       * @property {boolean} error
       * @property {Command} command
       * @property {function} write
       */
      /**
       * Add additional text to be displayed with the built-in help.
       *
       * Position is 'before' or 'after' to affect just this command,
       * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
       *
       * @param {string} position - before or after built-in help
       * @param {(string | Function)} text - string to add, or a function returning a string
       * @return {Command} `this` command for chaining
       */
      addHelpText(position, text) {
        const allowedValues = ["beforeAll", "before", "after", "afterAll"];
        if (!allowedValues.includes(position)) {
          throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        const helpEvent = `${position}Help`;
        this.on(helpEvent, (context) => {
          let helpStr;
          if (typeof text === "function") {
            helpStr = text({ error: context.error, command: context.command });
          } else {
            helpStr = text;
          }
          if (helpStr) {
            context.write(`${helpStr}
`);
          }
        });
        return this;
      }
      /**
       * Output help information if help flags specified
       *
       * @param {Array} args - array of options to search for help flags
       * @private
       */
      _outputHelpIfRequested(args) {
        const helpOption = this._getHelpOption();
        const helpRequested = helpOption && args.find((arg) => helpOption.is(arg));
        if (helpRequested) {
          this.outputHelp();
          this._exit(0, "commander.helpDisplayed", "(outputHelp)");
        }
      }
    };
    function incrementNodeInspectorPort(args) {
      return args.map((arg) => {
        if (!arg.startsWith("--inspect")) {
          return arg;
        }
        let debugOption;
        let debugHost = "127.0.0.1";
        let debugPort = "9229";
        let match;
        if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
          debugOption = match[1];
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
          debugOption = match[1];
          if (/^\d+$/.test(match[3])) {
            debugPort = match[3];
          } else {
            debugHost = match[3];
          }
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
          debugOption = match[1];
          debugHost = match[3];
          debugPort = match[4];
        }
        if (debugOption && debugPort !== "0") {
          return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
        }
        return arg;
      });
    }
    function useColor() {
      if (process2.env.NO_COLOR || process2.env.FORCE_COLOR === "0" || process2.env.FORCE_COLOR === "false")
        return false;
      if (process2.env.FORCE_COLOR || process2.env.CLICOLOR_FORCE !== void 0)
        return true;
      return void 0;
    }
    exports.Command = Command2;
    exports.useColor = useColor;
  }
});

// node_modules/.pnpm/commander@13.1.0/node_modules/commander/index.js
var require_commander = __commonJS({
  "node_modules/.pnpm/commander@13.1.0/node_modules/commander/index.js"(exports) {
    var { Argument: Argument2 } = require_argument();
    var { Command: Command2 } = require_command();
    var { CommanderError: CommanderError2, InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var { Help: Help2 } = require_help();
    var { Option: Option2 } = require_option();
    exports.program = new Command2();
    exports.createCommand = (name) => new Command2(name);
    exports.createOption = (flags, description) => new Option2(flags, description);
    exports.createArgument = (name, description) => new Argument2(name, description);
    exports.Command = Command2;
    exports.Option = Option2;
    exports.Argument = Argument2;
    exports.Help = Help2;
    exports.CommanderError = CommanderError2;
    exports.InvalidArgumentError = InvalidArgumentError2;
    exports.InvalidOptionArgumentError = InvalidArgumentError2;
  }
});

// node_modules/.pnpm/dotenv@16.6.1/node_modules/dotenv/package.json
var require_package = __commonJS({
  "node_modules/.pnpm/dotenv@16.6.1/node_modules/dotenv/package.json"(exports, module) {
    module.exports = {
      name: "dotenv",
      version: "16.6.1",
      description: "Loads environment variables from .env file",
      main: "lib/main.js",
      types: "lib/main.d.ts",
      exports: {
        ".": {
          types: "./lib/main.d.ts",
          require: "./lib/main.js",
          default: "./lib/main.js"
        },
        "./config": "./config.js",
        "./config.js": "./config.js",
        "./lib/env-options": "./lib/env-options.js",
        "./lib/env-options.js": "./lib/env-options.js",
        "./lib/cli-options": "./lib/cli-options.js",
        "./lib/cli-options.js": "./lib/cli-options.js",
        "./package.json": "./package.json"
      },
      scripts: {
        "dts-check": "tsc --project tests/types/tsconfig.json",
        lint: "standard",
        pretest: "npm run lint && npm run dts-check",
        test: "tap run --allow-empty-coverage --disable-coverage --timeout=60000",
        "test:coverage": "tap run --show-full-coverage --timeout=60000 --coverage-report=text --coverage-report=lcov",
        prerelease: "npm test",
        release: "standard-version"
      },
      repository: {
        type: "git",
        url: "git://github.com/motdotla/dotenv.git"
      },
      homepage: "https://github.com/motdotla/dotenv#readme",
      funding: "https://dotenvx.com",
      keywords: [
        "dotenv",
        "env",
        ".env",
        "environment",
        "variables",
        "config",
        "settings"
      ],
      readmeFilename: "README.md",
      license: "BSD-2-Clause",
      devDependencies: {
        "@types/node": "^18.11.3",
        decache: "^4.6.2",
        sinon: "^14.0.1",
        standard: "^17.0.0",
        "standard-version": "^9.5.0",
        tap: "^19.2.0",
        typescript: "^4.8.4"
      },
      engines: {
        node: ">=12"
      },
      browser: {
        fs: false
      }
    };
  }
});

// node_modules/.pnpm/dotenv@16.6.1/node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "node_modules/.pnpm/dotenv@16.6.1/node_modules/dotenv/lib/main.js"(exports, module) {
    var fs = __require("fs");
    var path2 = __require("path");
    var os = __require("os");
    var crypto = __require("crypto");
    var packageJson = require_package();
    var version = packageJson.version;
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse2(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj[key] = value;
      }
      return obj;
    }
    function _parseVault(options) {
      options = options || {};
      const vaultPath = _vaultPath(options);
      options.path = vaultPath;
      const result = DotenvModule.configDotenv(options);
      if (!result.parsed) {
        const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
        err.code = "MISSING_DATA";
        throw err;
      }
      const keys = _dotenvKey(options).split(",");
      const length = keys.length;
      let decrypted;
      for (let i = 0; i < length; i++) {
        try {
          const key = keys[i].trim();
          const attrs = _instructions(result, key);
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
          break;
        } catch (error) {
          if (i + 1 >= length) {
            throw error;
          }
        }
      }
      return DotenvModule.parse(decrypted);
    }
    function _warn(message) {
      console.log(`[dotenv@${version}][WARN] ${message}`);
    }
    function _debug(message) {
      console.log(`[dotenv@${version}][DEBUG] ${message}`);
    }
    function _log(message) {
      console.log(`[dotenv@${version}] ${message}`);
    }
    function _dotenvKey(options) {
      if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY;
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
      }
      return "";
    }
    function _instructions(result, dotenvKey) {
      let uri;
      try {
        uri = new URL(dotenvKey);
      } catch (error) {
        if (error.code === "ERR_INVALID_URL") {
          const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        }
        throw error;
      }
      const key = uri.password;
      if (!key) {
        const err = new Error("INVALID_DOTENV_KEY: Missing key part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environment = uri.searchParams.get("environment");
      if (!environment) {
        const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
      const ciphertext = result.parsed[environmentKey];
      if (!ciphertext) {
        const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
        err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
        throw err;
      }
      return { ciphertext, key };
    }
    function _vaultPath(options) {
      let possibleVaultPath = null;
      if (options && options.path && options.path.length > 0) {
        if (Array.isArray(options.path)) {
          for (const filepath of options.path) {
            if (fs.existsSync(filepath)) {
              possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
            }
          }
        } else {
          possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
        }
      } else {
        possibleVaultPath = path2.resolve(process.cwd(), ".env.vault");
      }
      if (fs.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
      }
      return null;
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path2.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function _configVault(options) {
      const debug = Boolean(options && options.debug);
      const quiet = options && "quiet" in options ? options.quiet : true;
      if (debug || !quiet) {
        _log("Loading env from encrypted .env.vault");
      }
      const parsed = DotenvModule._parseVault(options);
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsed, options);
      return { parsed };
    }
    function configDotenv(options) {
      const dotenvPath = path2.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      const debug = Boolean(options && options.debug);
      const quiet = options && "quiet" in options ? options.quiet : true;
      if (options && options.encoding) {
        encoding = options.encoding;
      } else {
        if (debug) {
          _debug("No encoding is specified. UTF-8 is used by default");
        }
      }
      let optionPaths = [dotenvPath];
      if (options && options.path) {
        if (!Array.isArray(options.path)) {
          optionPaths = [_resolveHome(options.path)];
        } else {
          optionPaths = [];
          for (const filepath of options.path) {
            optionPaths.push(_resolveHome(filepath));
          }
        }
      }
      let lastError;
      const parsedAll = {};
      for (const path3 of optionPaths) {
        try {
          const parsed = DotenvModule.parse(fs.readFileSync(path3, { encoding }));
          DotenvModule.populate(parsedAll, parsed, options);
        } catch (e) {
          if (debug) {
            _debug(`Failed to load ${path3} ${e.message}`);
          }
          lastError = e;
        }
      }
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsedAll, options);
      if (debug || !quiet) {
        const keysCount = Object.keys(parsedAll).length;
        const shortPaths = [];
        for (const filePath of optionPaths) {
          try {
            const relative3 = path2.relative(process.cwd(), filePath);
            shortPaths.push(relative3);
          } catch (e) {
            if (debug) {
              _debug(`Failed to load ${filePath} ${e.message}`);
            }
            lastError = e;
          }
        }
        _log(`injecting env (${keysCount}) from ${shortPaths.join(",")}`);
      }
      if (lastError) {
        return { parsed: parsedAll, error: lastError };
      } else {
        return { parsed: parsedAll };
      }
    }
    function config(options) {
      if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options);
      }
      const vaultPath = _vaultPath(options);
      if (!vaultPath) {
        _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
        return DotenvModule.configDotenv(options);
      }
      return DotenvModule._configVault(options);
    }
    function decrypt(encrypted, keyStr) {
      const key = Buffer.from(keyStr.slice(-64), "hex");
      let ciphertext = Buffer.from(encrypted, "base64");
      const nonce = ciphertext.subarray(0, 12);
      const authTag = ciphertext.subarray(-16);
      ciphertext = ciphertext.subarray(12, -16);
      try {
        const aesgcm = crypto.createDecipheriv("aes-256-gcm", key, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
      } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === "Invalid key length";
        const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
        if (isRange || invalidKeyLength) {
          const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        } else if (decryptionFailed) {
          const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
          err.code = "DECRYPTION_FAILED";
          throw err;
        } else {
          throw error;
        }
      }
    }
    function populate(processEnv, parsed, options = {}) {
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      if (typeof parsed !== "object") {
        const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
        err.code = "OBJECT_REQUIRED";
        throw err;
      }
      for (const key of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
          if (override === true) {
            processEnv[key] = parsed[key];
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key}" is already defined and WAS overwritten`);
            } else {
              _debug(`"${key}" is already defined and was NOT overwritten`);
            }
          }
        } else {
          processEnv[key] = parsed[key];
        }
      }
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config,
      decrypt,
      parse: parse2,
      populate
    };
    module.exports.configDotenv = DotenvModule.configDotenv;
    module.exports._configVault = DotenvModule._configVault;
    module.exports._parseVault = DotenvModule._parseVault;
    module.exports.config = DotenvModule.config;
    module.exports.decrypt = DotenvModule.decrypt;
    module.exports.parse = DotenvModule.parse;
    module.exports.populate = DotenvModule.populate;
    module.exports = DotenvModule;
  }
});

// node_modules/.pnpm/dotenv@16.6.1/node_modules/dotenv/lib/env-options.js
var require_env_options = __commonJS({
  "node_modules/.pnpm/dotenv@16.6.1/node_modules/dotenv/lib/env-options.js"(exports, module) {
    var options = {};
    if (process.env.DOTENV_CONFIG_ENCODING != null) {
      options.encoding = process.env.DOTENV_CONFIG_ENCODING;
    }
    if (process.env.DOTENV_CONFIG_PATH != null) {
      options.path = process.env.DOTENV_CONFIG_PATH;
    }
    if (process.env.DOTENV_CONFIG_QUIET != null) {
      options.quiet = process.env.DOTENV_CONFIG_QUIET;
    }
    if (process.env.DOTENV_CONFIG_DEBUG != null) {
      options.debug = process.env.DOTENV_CONFIG_DEBUG;
    }
    if (process.env.DOTENV_CONFIG_OVERRIDE != null) {
      options.override = process.env.DOTENV_CONFIG_OVERRIDE;
    }
    if (process.env.DOTENV_CONFIG_DOTENV_KEY != null) {
      options.DOTENV_KEY = process.env.DOTENV_CONFIG_DOTENV_KEY;
    }
    module.exports = options;
  }
});

// node_modules/.pnpm/dotenv@16.6.1/node_modules/dotenv/lib/cli-options.js
var require_cli_options = __commonJS({
  "node_modules/.pnpm/dotenv@16.6.1/node_modules/dotenv/lib/cli-options.js"(exports, module) {
    var re = /^dotenv_config_(encoding|path|quiet|debug|override|DOTENV_KEY)=(.+)$/;
    module.exports = function optionMatcher(args) {
      const options = args.reduce(function(acc, cur) {
        const matches = cur.match(re);
        if (matches) {
          acc[matches[1]] = matches[2];
        }
        return acc;
      }, {});
      if (!("quiet" in options)) {
        options.quiet = "true";
      }
      return options;
    };
  }
});

// src/utils/errors.ts
function isCliBackError(error) {
  return error instanceof CliBackError;
}
function formatError(error) {
  if (error instanceof AppError && error.cause !== void 0) {
    const inner = error.cause instanceof Error ? formatError(error.cause) : String(error.cause);
    return `${error.message}
  ${inner}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
var AppError, CliBackError;
var init_errors = __esm({
  "src/utils/errors.ts"() {
    "use strict";
    AppError = class extends Error {
      constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = "AppError";
      }
      cause;
    };
    CliBackError = class extends AppError {
      constructor(message = "Back", state) {
        super(message);
        this.state = state;
        this.name = "CliBackError";
      }
      state;
    };
  }
});

// src/ui/stub-react.ts
function useState(init) {
  return [init, () => {
  }];
}
function useMemo(fn) {
  return fn();
}
var jsx, jsxs, Fragment;
var init_stub_react = __esm({
  "src/ui/stub-react.ts"() {
    jsx = function() {
      return null;
    };
    jsxs = function() {
      return null;
    };
    Fragment = "fragment";
  }
});

// src/ui/stub-ink.ts
function Box() {
  return null;
}
function Text() {
  return null;
}
function useInput() {
}
function render() {
  return { clear() {
  }, unmount() {
  }, waitUntilExit() {
    return Promise.resolve();
  } };
}
var init_stub_ink = __esm({
  "src/ui/stub-ink.ts"() {
  }
});

// src/ui/ink-runner.tsx
async function runInkPrompt(renderPrompt) {
  return new Promise((resolve7) => {
    let app;
    let settled = false;
    const settle = (value) => {
      if (settled) return;
      settled = true;
      app?.clear();
      app?.unmount();
      resolve7(value);
    };
    app = render(renderPrompt({
      onSubmit: (value) => settle(value),
      onCancel: () => settle(void 0)
    }));
  });
}
var init_ink_runner = __esm({
  "src/ui/ink-runner.tsx"() {
    "use strict";
    init_stub_ink();
  }
});

// src/ui/ui-theme.ts
var uiTheme;
var init_ui_theme = __esm({
  "src/ui/ui-theme.ts"() {
    "use strict";
    uiTheme = {
      accent: "cyan",
      muted: "gray",
      error: "red",
      success: "green"
    };
  }
});

// src/ui/list-picker.tsx
function ListPicker({
  title,
  options,
  initialValue,
  submitHint = "select",
  cancelHint = "back",
  onSubmit,
  onCancel
}) {
  const initialIndex = useMemo(() => {
    const idx = initialValue === void 0 ? -1 : options.findIndex((option) => option.value === initialValue);
    return idx >= 0 ? idx : 0;
  }, [initialValue, options]);
  const [cursor, setCursor] = useState(initialIndex);
  useInput((input, key) => {
    if (options.length === 0) {
      onCancel();
      return;
    }
    if (key.upArrow) {
      setCursor((current) => current <= 0 ? options.length - 1 : current - 1);
      return;
    }
    if (key.downArrow) {
      setCursor((current) => current >= options.length - 1 ? 0 : current + 1);
      return;
    }
    if (key.return) {
      onSubmit(options[cursor].value);
      return;
    }
    if (key.escape || input === "q") {
      onCancel();
    }
  });
  return /* @__PURE__ */ jsxs(Box, { flexDirection: "column", children: [
    /* @__PURE__ */ jsx(Text, { color: uiTheme.accent, children: title }),
    /* @__PURE__ */ jsx(Text, { children: " " }),
    options.map((option, index) => /* @__PURE__ */ jsxs(Text, { color: index === cursor ? uiTheme.accent : void 0, inverse: index === cursor, children: [
      index === cursor ? "> " : "  ",
      option.label
    ] }, option.value)),
    /* @__PURE__ */ jsx(Text, { children: " " }),
    /* @__PURE__ */ jsxs(Text, { color: uiTheme.muted, children: [
      "[Enter] ",
      submitHint,
      "   [Esc] ",
      cancelHint,
      "   [\u2191\u2193] move"
    ] })
  ] });
}
async function runListPicker(args) {
  return runInkPrompt((props) => /* @__PURE__ */ jsx(ListPicker, { ...args, ...props }));
}
var init_list_picker = __esm({
  "src/ui/list-picker.tsx"() {
    "use strict";
    init_stub_react();
    init_stub_ink();
    init_ink_runner();
    init_ui_theme();
    init_stub_react();
  }
});

// src/ui/text-input-prompt.tsx
function TextInputPrompt({ title, defaultValue = "", validate, onSubmit, onCancel }) {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState();
  useInput((input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }
    if (key.return) {
      const validationError = validate?.(value);
      if (validationError) {
        setError(validationError);
        return;
      }
      onSubmit(value);
      return;
    }
    if (key.backspace || key.delete) {
      setValue((current) => current.slice(0, -1));
      setError(void 0);
      return;
    }
    if (key.leftArrow || key.rightArrow || key.upArrow || key.downArrow || key.tab) return;
    if (input) {
      setValue((current) => current + input);
      setError(void 0);
    }
  });
  return /* @__PURE__ */ jsxs(Box, { flexDirection: "column", children: [
    /* @__PURE__ */ jsx(Text, { color: uiTheme.accent, children: title }),
    /* @__PURE__ */ jsx(Text, { children: " " }),
    /* @__PURE__ */ jsxs(Text, { children: [
      "> ",
      value
    ] }),
    error ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Text, { children: " " }),
      /* @__PURE__ */ jsx(Text, { color: uiTheme.error, children: error })
    ] }) : null,
    /* @__PURE__ */ jsx(Text, { children: " " }),
    /* @__PURE__ */ jsx(Text, { color: uiTheme.muted, children: "[Enter] save   [Esc] cancel" })
  ] });
}
async function runTextInputPrompt(args) {
  return runInkPrompt((props) => /* @__PURE__ */ jsx(TextInputPrompt, { ...args, ...props }));
}
var init_text_input_prompt = __esm({
  "src/ui/text-input-prompt.tsx"() {
    "use strict";
    init_stub_react();
    init_stub_ink();
    init_ink_runner();
    init_ui_theme();
    init_stub_react();
  }
});

// src/ui/update-prompt.tsx
function formatBytes(bytes) {
  if (bytes <= 0) return "unknown size";
  const mib = bytes / 1024 / 1024;
  return `${mib.toFixed(1)} MiB`;
}
function UpdatePrompt({ update, onSubmit, onCancel }) {
  const options = [
    { label: "Install update now", value: "install" },
    { label: "Skip", value: "skip" }
  ];
  const [cursor, setCursor] = useState(0);
  useInput((input, key) => {
    if (key.upArrow || key.downArrow) {
      setCursor((current) => current === 0 ? 1 : 0);
      return;
    }
    if (key.return) {
      onSubmit(options[cursor].value);
      return;
    }
    if (key.escape || input === "q") {
      onCancel();
    }
  });
  return /* @__PURE__ */ jsxs(Box, { flexDirection: "column", children: [
    /* @__PURE__ */ jsxs(Text, { color: uiTheme.accent, children: [
      "Update available: ",
      update.currentVersion,
      " \u2192 ",
      update.latestVersion
    ] }),
    /* @__PURE__ */ jsxs(Text, { children: [
      "Asset: ",
      update.assetName,
      " (",
      formatBytes(update.size),
      ")"
    ] }),
    /* @__PURE__ */ jsxs(Text, { children: [
      "Release: ",
      update.releaseUrl
    ] }),
    /* @__PURE__ */ jsx(Text, { children: " " }),
    options.map((option, index) => /* @__PURE__ */ jsxs(Text, { color: index === cursor ? uiTheme.accent : void 0, inverse: index === cursor, children: [
      index === cursor ? "> " : "  ",
      option.label
    ] }, option.value)),
    /* @__PURE__ */ jsx(Text, { children: " " }),
    /* @__PURE__ */ jsx(Text, { color: uiTheme.muted, children: "[Enter] select   [Esc] skip   [\u2191\u2193] move" })
  ] });
}
async function runUpdatePrompt(update) {
  return runInkPrompt((props) => /* @__PURE__ */ jsx(UpdatePrompt, { update, ...props }));
}
var init_update_prompt = __esm({
  "src/ui/update-prompt.tsx"() {
    "use strict";
    init_stub_react();
    init_stub_ink();
    init_ink_runner();
    init_ui_theme();
    init_stub_react();
  }
});

// src/runtime/dsl/runtime-spec.ts
function indexByName(items) {
  const map = /* @__PURE__ */ new Map();
  for (const item of items) {
    map.set(item.name.toLowerCase(), item);
    for (const alias of item.aliases) map.set(alias.toLowerCase(), item);
  }
  return map;
}
function normalizeFlowCommandName(name) {
  return FLOW_COMMAND_SPEC_MAP.get(name.toLowerCase())?.name ?? name;
}
function getFlowCommandSpec(name) {
  return FLOW_COMMAND_SPEC_MAP.get(name.toLowerCase());
}
function getFlowFunctionSpec(name) {
  return FLOW_FUNCTION_SPEC_MAP.get(name.toLowerCase());
}
var FLOW_COMMAND_SPECS, FLOW_FUNCTION_SPECS, FLOW_COMMAND_SPEC_MAP, FLOW_FUNCTION_SPEC_MAP;
var init_runtime_spec = __esm({
  "src/runtime/dsl/runtime-spec.ts"() {
    "use strict";
    FLOW_COMMAND_SPECS = [
      { name: "goto", aliases: ["nav", "navUrl", "navurl"], desc: "Navigate to URL", pageOnly: true, minArgs: 1, maxArgs: 1 },
      { name: "newTab", aliases: [], desc: "Open and activate a new tab, optionally with URL", pageOnly: true, minArgs: 0, maxArgs: 1 },
      { name: "closeTab", aliases: [], desc: "Close active tab", pageOnly: true, minArgs: 0, maxArgs: 0 },
      { name: "activeTab", aliases: [], desc: "Activate tab by zero-based index or context id", pageOnly: true, minArgs: 1, maxArgs: 1 },
      { name: "backNav", aliases: [], desc: "Navigate browser history back", pageOnly: true, minArgs: 0, maxArgs: 1 },
      { name: "reloadNav", aliases: [], desc: "Reload current page", pageOnly: true, minArgs: 0, maxArgs: 0 },
      { name: "getUrl", aliases: [], desc: "Store current URL in pageUrl", pageOnly: true, minArgs: 0, maxArgs: 0, sideEffects: ["pageUrl"] },
      { name: "waitUrlChange", aliases: [], desc: "Wait until URL differs from given URL", pageOnly: true, minArgs: 1, maxArgs: 2, sideEffects: ["pageUrl"] },
      { name: "waitLoad", aliases: [], desc: "Wait for page load (2s settle + readyState)", pageOnly: true, minArgs: 0, maxArgs: 1 },
      { name: "waitElement", aliases: ["waitXPath"], desc: "Wait for XPath match (default 10s)", pageOnly: true, minArgs: 1, maxArgs: 2 },
      { name: "getElementAttribute", aliases: [], desc: "Store XPath attribute in elementAttribute", pageOnly: true, minArgs: 2, maxArgs: 2, sideEffects: ["elementAttribute"] },
      { name: "getElementText", aliases: [], desc: "Store XPath text in elementText", pageOnly: true, minArgs: 1, maxArgs: 1, sideEffects: ["elementText"] },
      { name: "countElement", aliases: [], desc: "Store XPath match count in elementCount", pageOnly: true, minArgs: 1, maxArgs: 1, sideEffects: ["elementCount"] },
      { name: "click", aliases: [], desc: "Click element by XPath", pageOnly: true, minArgs: 1, maxArgs: 1 },
      { name: "typeText", aliases: ["type"], desc: "Type text into element", pageOnly: true, minArgs: 2, maxArgs: Infinity },
      { name: "pasteText", aliases: [], desc: "Paste text via clipboard", pageOnly: true, minArgs: 2, maxArgs: Infinity },
      { name: "moveMouse", aliases: [], desc: "Move mouse to XPath element", pageOnly: true, minArgs: 1, maxArgs: 1 },
      { name: "scroll", aliases: [], desc: "Scroll page by pixels", pageOnly: true, minArgs: 0, maxArgs: 1 },
      { name: "js", aliases: ["executeJs", "executeJS"], desc: "Execute JavaScript and store result in jsResult", pageOnly: true, minArgs: 1, maxArgs: 1, sideEffects: ["jsResult"] },
      { name: "fileUpload", aliases: [], desc: "Upload file into input[type=file] XPath when supported", pageOnly: true, minArgs: 2, maxArgs: 2 },
      { name: "info", aliases: [], desc: "Log page title and URL", pageOnly: true, minArgs: 0, maxArgs: 0 },
      { name: "httpRequest", aliases: [], desc: "Run HTTP request and store httpStatus/httpHeaders/httpBody/httpUrl", minArgs: 2, maxArgs: 5, sideEffects: ["httpStatus", "httpHeaders", "httpBody", "httpUrl"] },
      { name: "httpDownload", aliases: [], desc: "Download URL to file and store downloadPath/downloadBytes", minArgs: 2, maxArgs: 2, sideEffects: ["downloadPath", "downloadBytes"] },
      { name: "fileWriteAllText", aliases: [], desc: "Overwrite a text file", minArgs: 2, maxArgs: 2 },
      { name: "fileAppendText", aliases: [], desc: "Append text to a file", minArgs: 2, maxArgs: 2 },
      { name: "sendKey", aliases: [], desc: "Send keyboard key(s), multiple keys = chord", pageOnly: true, minArgs: 1, maxArgs: Infinity },
      { name: "exit", aliases: [], desc: "Stop the flow script successfully", minArgs: 0, maxArgs: 1 },
      { name: "writeExcel", aliases: [], desc: "Write a value to an Excel cell", minArgs: 4, maxArgs: 4 },
      { name: "delay", aliases: ["sleep"], desc: "Sleep N ms (or N-M for random range)", minArgs: 1, maxArgs: 2 },
      { name: "log", aliases: [], desc: "Log message", minArgs: 1, maxArgs: Infinity },
      { name: "help", aliases: [], desc: "Show available commands", minArgs: 0, maxArgs: 0 }
    ];
    FLOW_FUNCTION_SPECS = [
      { name: "getUrl", aliases: [], desc: "Return current page URL", pageOnly: true, minArgs: 0, maxArgs: 0 },
      { name: "httpRequest", aliases: [], desc: "Run HTTP request and return raw response text", minArgs: 2, maxArgs: 4 },
      { name: "js", aliases: ["executeJs", "executeJS"], desc: "Execute JavaScript and return result", pageOnly: true, minArgs: 1, maxArgs: 1 },
      { name: "getElementText", aliases: [], desc: "Return XPath text", pageOnly: true, minArgs: 1, maxArgs: 1 },
      { name: "getElementAttribute", aliases: [], desc: "Return XPath attribute", pageOnly: true, minArgs: 2, maxArgs: 2 },
      { name: "countElement", aliases: [], desc: "Return XPath match count", pageOnly: true, minArgs: 1, maxArgs: 1 },
      { name: "hasElement", aliases: ["existsXPath"], desc: "Check XPath exists", pageOnly: true, minArgs: 1, maxArgs: 1 },
      { name: "splitText", aliases: [], desc: "Split text by delimiter and return an array", minArgs: 2, maxArgs: 2 },
      { name: "contains", aliases: [], desc: "Check whether one string contains another, or check whether second string is empty when first is empty", minArgs: 2, maxArgs: 2 },
      { name: "readJson", aliases: [], desc: "Read JSON value by dotted path", minArgs: 1, maxArgs: 2 },
      { name: "randomNum", aliases: [], desc: "Return random integer between min and max", minArgs: 2, maxArgs: 2 },
      { name: "fileExist", aliases: [], desc: "Check file exists", minArgs: 1, maxArgs: 1 },
      { name: "folderExist", aliases: [], desc: "Check folder exists", minArgs: 1, maxArgs: 1 },
      { name: "getFiles", aliases: [], desc: "List files in folder (non-recursive, returns full paths)", minArgs: 1, maxArgs: 1 },
      { name: "arrayLength", aliases: [], desc: "Return array length", minArgs: 1, maxArgs: 1 },
      { name: "readExcel", aliases: [], desc: "Read value from Excel cell by header and row", minArgs: 3, maxArgs: 3 },
      { name: "findRow", aliases: [], desc: "Search text in Excel, return first matching row index (0-based) or null", minArgs: 2, maxArgs: 2 },
      { name: "fileReadAllText", aliases: [], desc: "Read entire text file", minArgs: 1, maxArgs: 1 },
      { name: "2FA", aliases: [], desc: "Fetch TOTP token from https://2fa.live", minArgs: 1, maxArgs: 1 }
    ];
    FLOW_COMMAND_SPEC_MAP = indexByName(FLOW_COMMAND_SPECS);
    FLOW_FUNCTION_SPEC_MAP = indexByName(FLOW_FUNCTION_SPECS);
  }
});

// src/runtime/dsl/parser.ts
function parseFlowProgram(source) {
  const lines = source.split(/\r?\n/).map((raw, index) => ({ raw, lineNumber: index + 1 }));
  const hasBlocks = lines.some(({ raw }) => {
    const line = stripComment(raw).trim();
    return /^inputs\s*\{\s*$/i.test(line) || BLOCK_PATTERNS.some((item) => item.pattern.test(line));
  });
  if (!hasBlocks) {
    const legacyCommands = parseStatements(toParsedLines(lines), 0, -1).statements;
    return {
      inputs: [],
      beforeRunProfile: [],
      main: legacyCommands,
      afterKillProfile: [],
      legacyCommands
    };
  }
  const program3 = {
    inputs: [],
    beforeRunProfile: [],
    main: [],
    afterKillProfile: []
  };
  let currentBlock = null;
  let currentBlockIndent = -1;
  let blockLines = [];
  let sawMain = false;
  const flushBlock = () => {
    if (currentBlock === null) return;
    if (currentBlock === "inputs") {
      for (const item of blockLines) {
        const line = stripComment(item.raw).trim();
        if (line) program3.inputs.push(parseInputLine(line, item.lineNumber));
      }
    } else {
      program3[currentBlock] = parseStatements(toParsedLines(blockLines), 0, currentBlockIndent).statements;
    }
    blockLines = [];
  };
  for (const item of lines) {
    const line = stripComment(item.raw).trim();
    if (!line) continue;
    const indent = countIndent(item.raw);
    if (line === "}" && currentBlock !== null && indent <= currentBlockIndent) {
      flushBlock();
      currentBlock = null;
      currentBlockIndent = -1;
      continue;
    }
    if (currentBlock === null) {
      if (/^inputs\s*\{\s*$/i.test(line)) {
        currentBlock = "inputs";
        currentBlockIndent = indent;
        continue;
      }
      const block = BLOCK_PATTERNS.find((entry) => entry.pattern.test(line));
      if (block) {
        if (!line.endsWith("{")) {
          if (block.key === "main") throw new AppError(`Line ${item.lineNumber}: running block must include { ... }.`);
          program3[block.key] = [];
          continue;
        }
        currentBlock = block.key;
        currentBlockIndent = indent;
        if (block.key === "main") sawMain = true;
        continue;
      }
      throw new AppError(`Line ${item.lineNumber}: expected inputs, before, running, or after block.`);
    }
    blockLines.push(item);
  }
  if (currentBlock !== null) flushBlock();
  if (!sawMain) throw new AppError("Flow script must include a running { ... } block.");
  return program3;
}
function parseStatements(lines, startIndex, parentIndent) {
  const statements = [];
  let index = startIndex;
  while (index < lines.length) {
    const item = lines[index];
    if (!item) break;
    if (item.line === "}") {
      index += 1;
      continue;
    }
    if (item.indent <= parentIndent) break;
    if (/^else\b/i.test(item.line)) break;
    if (/^if\b/i.test(item.line)) {
      const parsed = parseIfStatement(lines, index, parentIndent);
      statements.push(parsed.statement);
      index = parsed.nextIndex;
      continue;
    }
    if (/^while\b/i.test(item.line)) {
      const conditionText = stripOptionalOpenBrace(item.line.replace(/^while\s+/i, "").trim());
      const body = parseChildBlock(lines, index);
      statements.push({ type: "while", condition: parseExpression(conditionText, item.lineNumber), body: body.statements, lineNumber: item.lineNumber, raw: item.raw });
      index = body.nextIndex;
      continue;
    }
    if (/^for\b/i.test(item.line)) {
      statements.push(parseForLine(item));
      const body = parseChildBlock(lines, index);
      const forStatement = statements[statements.length - 1];
      if (forStatement?.type === "for") forStatement.body = body.statements;
      index = body.nextIndex;
      continue;
    }
    statements.push(parseSimpleStatement(item));
    index += 1;
  }
  return { statements, nextIndex: index };
}
function parseIfStatement(lines, startIndex, parentIndent) {
  const first = lines[startIndex];
  if (!first) throw new AppError("Unexpected end of if statement.");
  const branches = [];
  const firstCondition = stripOptionalOpenBrace(first.line.replace(/^if\s+/i, "").trim());
  const firstBody = parseChildBlock(lines, startIndex);
  branches.push({ condition: parseExpression(firstCondition, first.lineNumber), body: firstBody.statements, lineNumber: first.lineNumber, raw: first.raw });
  let index = firstBody.nextIndex;
  let elseBody;
  while (index < lines.length) {
    const item = lines[index];
    if (!item || item.indent !== first.indent || item.indent <= parentIndent) break;
    if (/^else\s+if\b/i.test(item.line)) {
      const conditionText = stripOptionalOpenBrace(item.line.replace(/^else\s+if\s+/i, "").trim());
      const body = parseChildBlock(lines, index);
      branches.push({ condition: parseExpression(conditionText, item.lineNumber), body: body.statements, lineNumber: item.lineNumber, raw: item.raw });
      index = body.nextIndex;
      continue;
    }
    if (/^else\b/i.test(item.line)) {
      const rest = stripOptionalOpenBrace(item.line.replace(/^else\b/i, "").trim());
      if (rest) throw new AppError(`Line ${item.lineNumber}: else cannot have a condition. Use else if.`);
      const body = parseChildBlock(lines, index);
      elseBody = body.statements;
      index = body.nextIndex;
    }
    break;
  }
  return { statement: { type: "if", branches, elseBody, lineNumber: first.lineNumber, raw: first.raw }, nextIndex: index };
}
function parseChildBlock(lines, headerIndex) {
  const header = lines[headerIndex];
  if (!header) throw new AppError("Unexpected end of block.");
  const next = lines[headerIndex + 1];
  if (!next || next.indent <= header.indent) throw new AppError(`Line ${header.lineNumber}: expected indented block after "${header.line}".`);
  return parseStatements(lines, headerIndex + 1, header.indent);
}
function parseForLine(item) {
  const rest = stripOptionalOpenBrace(item.line.replace(/^for\s+/i, "").trim());
  const parts = splitTopLevel(rest, ";");
  if (parts.length !== 3) throw new AppError(`Line ${item.lineNumber}: for syntax: for i = 0; i < 3; i = i + 1 (note: i++ is not supported, use i = i + 1)`);
  return {
    type: "for",
    init: parseAssignmentText(parts[0] ?? "", item),
    condition: parseExpression(parts[1] ?? "", item.lineNumber),
    update: parseAssignmentText(parts[2] ?? "", item),
    body: [],
    lineNumber: item.lineNumber,
    raw: item.raw
  };
}
function parseSimpleStatement(item) {
  if (/^nextLoop$/i.test(item.line)) {
    return { type: "loopControl", control: "next", lineNumber: item.lineNumber, raw: item.raw };
  }
  if (/^exitLoop$/i.test(item.line)) {
    return { type: "loopControl", control: "exit", lineNumber: item.lineNumber, raw: item.raw };
  }
  const assignment = parseAssignmentText(item.line, item, false);
  if (assignment) return assignment;
  const command = parseFlowLine(item.raw, item.lineNumber);
  if (!command) throw new AppError(`Line ${item.lineNumber}: invalid statement.`);
  return { ...command, type: "command" };
}
function parseAssignmentText(text, item, required = true) {
  const match = text.trim().match(/^(?:set\s+)?(?:\$\{([A-Za-z_][\w-]*)\}|([A-Za-z_][\w-]*))\s*=\s*(.+)$/i);
  if (!match) {
    if (!required) return null;
    throw new AppError(`Line ${item.lineNumber}: expected assignment, got "${text.trim()}".`);
  }
  return { type: "assignment", name: match[1] ?? match[2] ?? "", value: parseExpression(match[3] ?? "", item.lineNumber), lineNumber: item.lineNumber, raw: item.raw };
}
function parseFlowLine(raw, lineNumber) {
  const line = stripComment(raw).trim();
  if (!line) return null;
  const functionLike = line.match(/^([A-Za-z][\w-]*)\s*\((.*)\)$/);
  if (!functionLike) throw new AppError(`Line ${lineNumber}: expected commandName(arg1, arg2).`);
  return {
    command: normalizeFlowCommandName(functionLike[1] ?? ""),
    args: splitArgs(functionLike[2] ?? "", lineNumber, ",").map((arg) => unquote(arg, lineNumber)),
    lineNumber,
    raw
  };
}
function parseExpression(text, lineNumber) {
  const parser = new ExpressionParser(tokenizeExpression(text, lineNumber), lineNumber);
  return parser.parse();
}
function tokenizeExpression(text, lineNumber) {
  const tokens = [];
  let index = 0;
  while (index < text.length) {
    const char = text[index] ?? "";
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }
    if (char === '"' || char === "'") {
      const parsed = readRawQuotedString(text, index, lineNumber);
      index = parsed.nextIndex;
      tokens.push({ type: "string", value: parsed.value });
      continue;
    }
    if (/\d/.test(char) || char === "." && /\d/.test(text[index + 1] ?? "")) {
      let value = char;
      index += 1;
      while (index < text.length && /[\d.]/.test(text[index] ?? "")) {
        value += text[index] ?? "";
        index += 1;
      }
      if (value.length <= 2 && index < text.length && /[A-Za-z_]/.test(text[index] ?? "")) {
        while (index < text.length && /[A-Za-z0-9_-]/.test(text[index] ?? "")) {
          value += text[index] ?? "";
          index += 1;
        }
        tokens.push({ type: "identifier", value });
        continue;
      }
      tokens.push({ type: "number", value });
      continue;
    }
    if (/[A-Za-z_]/.test(char)) {
      let value = char;
      index += 1;
      while (index < text.length && /[A-Za-z0-9_-]/.test(text[index] ?? "")) {
        value += text[index] ?? "";
        index += 1;
      }
      if (value === "true" || value === "false") tokens.push({ type: "boolean", value });
      else if (value === "null") tokens.push({ type: "null", value });
      else tokens.push({ type: "identifier", value });
      continue;
    }
    const two = text.slice(index, index + 2);
    if (["==", "!=", "<=", ">=", "&&", "||"].includes(two)) {
      tokens.push({ type: "operator", value: two });
      index += 2;
      continue;
    }
    if (["+", "-", "*", "/", "%", "<", ">", "!"].includes(char)) {
      tokens.push({ type: "operator", value: char });
      index += 1;
      continue;
    }
    if (char === "(" || char === ")") {
      tokens.push({ type: "paren", value: char });
      index += 1;
      continue;
    }
    if (char === "[" || char === "]") {
      tokens.push({ type: "bracket", value: char });
      index += 1;
      continue;
    }
    if (char === ",") {
      tokens.push({ type: "comma", value: char });
      index += 1;
      continue;
    }
    throw new AppError(`Line ${lineNumber}: unexpected character "${char}".`);
  }
  return tokens;
}
function getPrecedence(operator) {
  switch (operator) {
    case "||":
      return 1;
    case "&&":
      return 2;
    case "==":
    case "!=":
      return 3;
    case "<":
    case "<=":
    case ">":
    case ">=":
      return 4;
    case "+":
    case "-":
      return 5;
    case "*":
    case "/":
    case "%":
      return 6;
    default:
      return -1;
  }
}
function toParsedLines(lines) {
  return lines.map((item) => ({ raw: item.raw, line: stripComment(item.raw).trim(), lineNumber: item.lineNumber, indent: countIndent(item.raw) })).filter((item) => item.line.length > 0);
}
function countIndent(line) {
  let indent = 0;
  for (const char of line) {
    if (char === " ") indent += 1;
    else if (char === "	") indent += 2;
    else break;
  }
  return indent;
}
function stripOptionalOpenBrace(line) {
  return line.endsWith("{") ? line.slice(0, -1).trim() : line;
}
function splitTopLevel(input, delimiter) {
  const parts = [];
  let current = "";
  let quote = null;
  let depth = 0;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index] ?? "";
    if (isQuote(char)) {
      current += char;
      if (quote === char && input[index + 1] === char) {
        current += input[index + 1] ?? "";
        index += 1;
        continue;
      }
      quote = quote === char ? null : quote ?? char;
      continue;
    }
    if (quote === null && char === "(") depth += 1;
    if (quote === null && char === ")") depth -= 1;
    if (quote === null && depth === 0 && char === delimiter) {
      parts.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  parts.push(current.trim());
  return parts;
}
function parseInputLine(line, lineNumber) {
  const match = line.match(/^([A-Za-z_][\w-]*)\s*(?::\s*([A-Za-z][\w-]*)(?:\s*(\[[^\]]*\]))?)?\s*(?:=\s*(.+))?$/);
  if (!match) throw new AppError(`Line ${lineNumber}: invalid input declaration.`);
  const name = match[1] ?? "";
  const rawType = match[2] ?? "input";
  const type = normalizeInputType(rawType, lineNumber);
  const optionsText = match[3];
  const defaultText = match[4]?.trim();
  const options = optionsText ? parseOptions(optionsText, lineNumber) : void 0;
  if (type === "comboBox" && (!options || options.length === 0)) throw new AppError(`Line ${lineNumber}: comboBox input requires options, e.g. comboBox ["a", "b"].`);
  if (type !== "comboBox" && options) throw new AppError(`Line ${lineNumber}: only comboBox inputs can declare options.`);
  const defaultValue = defaultText === void 0 ? void 0 : parseDefaultValue(type, defaultText, options, lineNumber);
  return { name, type, lineNumber, defaultValue, options };
}
function normalizeInputType(value, lineNumber) {
  const normalized = value.toLowerCase();
  if (normalized === "string") return "text";
  if (normalized === "boolean" || normalized === "bool") return "checkbox";
  if (normalized === "combobox" || normalized === "combo") return "comboBox";
  if (normalized === "inputexcelfile" || normalized === "excel") return "inputExcelFile";
  if (["input", "text", "number", "file", "folder", "checkbox"].includes(normalized)) return normalized;
  throw new AppError(`Line ${lineNumber}: unknown input type "${value}".`);
}
function parseOptions(optionsText, lineNumber) {
  const inner = optionsText.slice(1, -1);
  const options = splitArgs(inner, lineNumber, ",").map((option) => unquote(option, lineNumber));
  if (options.some((option) => option.length === 0)) throw new AppError(`Line ${lineNumber}: comboBox options cannot be empty.`);
  return options;
}
function parseDefaultValue(type, text, options, lineNumber) {
  const unquoted = unquote(text, lineNumber);
  switch (type) {
    case "number": {
      const numberValue = Number(unquoted);
      if (!Number.isFinite(numberValue)) throw new AppError(`Line ${lineNumber}: invalid number default "${text}".`);
      return numberValue;
    }
    case "checkbox": {
      if (/^(true|1|yes|on)$/i.test(unquoted)) return true;
      if (/^(false|0|no|off)$/i.test(unquoted)) return false;
      throw new AppError(`Line ${lineNumber}: invalid checkbox default "${text}".`);
    }
    case "comboBox": {
      if (!options?.includes(unquoted)) throw new AppError(`Line ${lineNumber}: comboBox default must be one declared option.`);
      return unquoted;
    }
    case "input":
      return autodetectValue(unquoted);
    case "text":
    case "file":
    case "folder":
    case "inputExcelFile":
      return unquoted;
  }
}
function autodetectValue(value) {
  if (/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value)) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return value;
}
function unquote(value, lineNumber) {
  const trimmed = value.trim();
  const quote = trimmed[0] ?? "";
  if (isQuote(quote)) {
    const parsed = readRawQuotedString(trimmed, 0, lineNumber);
    if (parsed.nextIndex !== trimmed.length) throw new AppError(`Line ${lineNumber}: unexpected text after quoted string.`);
    return parsed.value;
  }
  if (trimmed.endsWith('"') || trimmed.endsWith("'")) throw new AppError(`Line ${lineNumber}: unterminated quote.`);
  return trimmed;
}
function stripComment(line) {
  let quote = null;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index] ?? "";
    if (isQuote(char)) {
      if (quote === char && line[index + 1] === char) {
        index += 1;
        continue;
      }
      quote = quote === char ? null : quote ?? char;
      continue;
    }
    if (char === "#" && quote === null) return line.slice(0, index);
    if (char === "/" && line[index + 1] === "/" && quote === null) return line.slice(0, index);
  }
  return line;
}
function splitArgs(input, lineNumber, delimiter) {
  const args = [];
  let current = "";
  let quote = null;
  let parenDepth = 0;
  let braceDepth = 0;
  let bracketDepth = 0;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index] ?? "";
    if (isQuote(char)) {
      current += char;
      if (quote === char && input[index + 1] === char) {
        current += input[index + 1] ?? "";
        index += 1;
        continue;
      }
      quote = quote === char ? null : quote ?? char;
      continue;
    }
    if (quote === null) {
      if (char === "(") parenDepth += 1;
      else if (char === ")") parenDepth -= 1;
      else if (char === "{") braceDepth += 1;
      else if (char === "}") braceDepth -= 1;
      else if (char === "[") bracketDepth += 1;
      else if (char === "]") bracketDepth -= 1;
    }
    const isDelimiter = quote === null && (delimiter ? char === delimiter && parenDepth === 0 && braceDepth === 0 && bracketDepth === 0 : /\s/.test(char));
    if (isDelimiter) {
      pushArg(args, current);
      current = "";
      continue;
    }
    current += char;
  }
  if (quote !== null) throw new AppError(`Line ${lineNumber}: unterminated quote.`);
  pushArg(args, current);
  return args;
}
function readRawQuotedString(input, startIndex, lineNumber) {
  const quote = input[startIndex] ?? "";
  if (!isQuote(quote)) throw new AppError(`Line ${lineNumber}: expected quote.`);
  let value = "";
  let index = startIndex + 1;
  while (index < input.length) {
    const char = input[index] ?? "";
    if (char === "$" && input[index + 1] === "{") {
      value += "${";
      index += 2;
      let braceDepth = 1;
      while (index < input.length && braceDepth > 0) {
        const c = input[index] ?? "";
        if (c === "{") braceDepth += 1;
        else if (c === "}") braceDepth -= 1;
        value += c;
        index += 1;
      }
      if (braceDepth !== 0) throw new AppError(`Line ${lineNumber}: unterminated interpolation.`);
      continue;
    }
    if (char === quote) {
      if (input[index + 1] === quote) {
        value += quote;
        index += 2;
        continue;
      }
      return { value, nextIndex: index + 1 };
    }
    value += char;
    index += 1;
  }
  throw new AppError(`Line ${lineNumber}: unterminated quote.`);
}
function isQuote(value) {
  return value === '"' || value === "'";
}
function pushArg(args, value) {
  const trimmed = value.trim();
  if (trimmed) args.push(trimmed);
}
var BLOCK_PATTERNS, ExpressionParser;
var init_parser = __esm({
  "src/runtime/dsl/parser.ts"() {
    "use strict";
    init_errors();
    init_runtime_spec();
    BLOCK_PATTERNS = [
      { key: "beforeRunProfile", pattern: /^(?:before(?:\s+run\s+profile)?|before\s*\(\s*\))\s*(\{)?\s*$/i },
      { key: "main", pattern: /^(?:running\s*\(\s*\)|running|run\s+profile)\s*(\{)?\s*$/i },
      { key: "afterKillProfile", pattern: /^(?:after(?:\s+kill\s+profile)?|after\s*\(\s*\))\s*(\{)?\s*$/i }
    ];
    ExpressionParser = class {
      constructor(tokens, lineNumber) {
        this.tokens = tokens;
        this.lineNumber = lineNumber;
      }
      tokens;
      lineNumber;
      index = 0;
      parse() {
        const expression = this.parseBinary(0);
        if (this.peek()) throw new AppError(`Line ${this.lineNumber}: unexpected token "${this.peek()?.value}".`);
        return expression;
      }
      parseBinary(minPrecedence) {
        let left = this.parseUnary();
        while (true) {
          const token = this.peek();
          if (!token || token.type !== "operator") break;
          const precedence = getPrecedence(token.value);
          if (precedence < minPrecedence) break;
          this.next();
          const right = this.parseBinary(precedence + 1);
          left = { type: "binary", operator: token.value, left, right };
        }
        return left;
      }
      parseUnary() {
        const token = this.peek();
        if (token?.type === "operator" && (token.value === "!" || token.value === "-")) {
          this.next();
          return { type: "unary", operator: token.value, argument: this.parseUnary() };
        }
        return this.parsePrimary();
      }
      parsePrimary() {
        let expression = this.parseBase();
        while (this.peek()?.value === "[") {
          this.next();
          const index = this.parseBinary(0);
          this.expect("]");
          expression = { type: "index", object: expression, index };
        }
        return expression;
      }
      parseBase() {
        const token = this.next();
        if (!token) throw new AppError(`Line ${this.lineNumber}: expected expression.`);
        if (token.type === "number") return { type: "literal", value: Number(token.value) };
        if (token.type === "string") return { type: "literal", value: token.value };
        if (token.type === "boolean") return { type: "literal", value: token.value === "true" };
        if (token.type === "null") return { type: "literal", value: null };
        if (token.type === "identifier") {
          if (this.peek()?.value === "(") {
            this.next();
            const args = [];
            if (this.peek()?.value !== ")") {
              while (true) {
                args.push(this.parseBinary(0));
                if (this.peek()?.type !== "comma") break;
                this.next();
              }
            }
            this.expect(")");
            return { type: "call", name: token.value, args };
          }
          return { type: "variable", name: token.value };
        }
        if (token.value === "(") {
          const expression = this.parseBinary(0);
          this.expect(")");
          return expression;
        }
        throw new AppError(`Line ${this.lineNumber}: unexpected token "${token.value}".`);
      }
      peek() {
        return this.tokens[this.index];
      }
      next() {
        const token = this.tokens[this.index];
        this.index += 1;
        return token;
      }
      expect(value) {
        const token = this.next();
        if (token?.value !== value) throw new AppError(`Line ${this.lineNumber}: expected "${value}".`);
      }
    };
  }
});

// src/runtime/dsl/catalog.ts
var FLOW_COMMANDS, FLOW_FUNCTIONS, FLOW_SYNTAX_COMPLETIONS, FLOW_INPUT_COMPLETIONS, FLOW_COMPLETIONS, RDELAY_DESC, COMMAND_LIST, FUNCTION_LIST, PAGE_COMMANDS, PAGE_FUNCTIONS;
var init_catalog = __esm({
  "src/runtime/dsl/catalog.ts"() {
    "use strict";
    init_runtime_spec();
    FLOW_COMMANDS = FLOW_COMMAND_SPECS.map((item) => ({
      name: item.name,
      aliases: item.aliases,
      desc: item.desc,
      kind: "command",
      snippet: `${item.aliases[0] ?? item.name}()`,
      pageOnly: item.pageOnly
    }));
    FLOW_FUNCTIONS = FLOW_FUNCTION_SPECS.map((item) => ({
      name: item.name,
      aliases: item.aliases,
      desc: item.desc,
      kind: "function",
      snippet: `${item.aliases[0] ?? item.name}()`,
      pageOnly: item.pageOnly
    }));
    FLOW_SYNTAX_COMPLETIONS = [
      { name: "inputs", aliases: [], desc: "Declare script inputs", kind: "syntax", snippet: "inputs {\n  \n}" },
      { name: "before", aliases: ["before()"], desc: "Run before launching browser profile", kind: "syntax", snippet: "before() {\n  \n}" },
      { name: "running", aliases: ["running()"], desc: "Run after browser connects", kind: "syntax", snippet: "running() {\n  \n}" },
      { name: "after", aliases: ["after()"], desc: "Run after browser profile is killed", kind: "syntax", snippet: "after() {\n  \n}" },
      { name: "if", aliases: [], desc: "Conditional block", kind: "syntax", snippet: "if  {\n  \n}" },
      { name: "else if", aliases: ["elseif"], desc: "Conditional branch", kind: "syntax", snippet: "else if  {\n  \n}" },
      { name: "else", aliases: [], desc: "Fallback branch", kind: "syntax", snippet: "else {\n  \n}" },
      { name: "while", aliases: [], desc: "While loop", kind: "syntax", snippet: "while  {\n  \n}" },
      { name: "for", aliases: [], desc: "For loop", kind: "syntax", snippet: "for i = 0; i < ; i = i + 1\n  " },
      { name: "nextLoop", aliases: [], desc: "Skip to next loop iteration", kind: "syntax", snippet: "nextLoop" },
      { name: "exitLoop", aliases: [], desc: "Exit current loop", kind: "syntax", snippet: "exitLoop" },
      { name: "rDelay", aliases: ["rDelay()"], desc: "Append random delay as last input", kind: "syntax", snippet: "rDelay()" }
    ];
    FLOW_INPUT_COMPLETIONS = [
      { name: "input", aliases: [], desc: "Text or number input", kind: "syntax", snippet: 'name: input = ""' },
      { name: "text", aliases: [], desc: "Text input", kind: "syntax", snippet: 'name: text = ""' },
      { name: "number", aliases: [], desc: "Number input", kind: "syntax", snippet: "name: number = 0" },
      { name: "file", aliases: [], desc: "File picker", kind: "syntax", snippet: 'name: file = ""' },
      { name: "folder", aliases: [], desc: "Folder picker", kind: "syntax", snippet: 'name: folder = ""' },
      { name: "checkbox", aliases: ["bool"], desc: "Boolean input", kind: "syntax", snippet: "name: checkbox = false" },
      { name: "comboBox", aliases: ["combo"], desc: "Choice list", kind: "syntax", snippet: 'name: comboBox ["fast", "safe"] = "fast"' },
      { name: "inputExcelFile", aliases: ["excel"], desc: "Excel file input", kind: "syntax", snippet: 'name: inputExcelFile = ""' }
    ];
    FLOW_COMPLETIONS = [
      ...FLOW_COMMANDS,
      ...FLOW_FUNCTIONS.filter((item) => !FLOW_COMMANDS.some((command) => command.name === item.name)),
      ...FLOW_SYNTAX_COMPLETIONS
    ];
    RDELAY_DESC = '  rDelay \u2014 append as last input of any command for random delay after execution (optional), e.g. nav("url", rDelay(3000,4000))';
    COMMAND_LIST = FLOW_COMMANDS.map((c) => `  ${c.name}${c.aliases.length ? ` (${c.aliases.join("/")})` : ""} \u2014 ${c.desc}`).join("\n");
    FUNCTION_LIST = FLOW_FUNCTIONS.map((f) => `  ${f.name}${f.aliases.length ? ` (${f.aliases.join("/")})` : ""} \u2014 ${f.desc}`).join("\n");
    PAGE_COMMANDS = new Set(
      FLOW_COMMANDS.filter((item) => item.pageOnly).flatMap((item) => [item.name, ...item.aliases]).map((item) => item.toLowerCase())
    );
    PAGE_FUNCTIONS = new Set(
      FLOW_FUNCTIONS.filter((item) => item.pageOnly).flatMap((item) => [item.name, ...item.aliases]).map((item) => item.toLowerCase())
    );
  }
});

// src/ui/flow-script-editor.tsx
function splitLines(source) {
  const lines = source.split("\n");
  return lines.length === 0 ? [""] : lines;
}
function joinLines(lines) {
  return lines.join("\n");
}
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function tokenStart(line, column) {
  let index = column;
  while (index > 0 && /[A-Za-z0-9_-]/.test(line[index - 1] ?? "")) index -= 1;
  return index;
}
function currentToken(line, column) {
  const start = tokenStart(line, column);
  return { token: line.slice(start, column), start };
}
function matchesCompletion(item, token) {
  const lowered = token.toLowerCase();
  if (!lowered) return true;
  return [item.name, ...item.aliases].some((value) => value.toLowerCase().startsWith(lowered));
}
function getActiveCompletions(token, isInputBlock) {
  const source = isInputBlock ? FLOW_INPUT_COMPLETIONS : FLOW_COMPLETIONS;
  if (!token) return source;
  return source.filter((item) => matchesCompletion(item, token));
}
function isInsideInterpolation(line, column) {
  return interpolationStart(line, column) >= 0;
}
function isInsideInputsBlock(lines, cursor) {
  let block = false;
  for (let lineIndex = 0; lineIndex <= cursor.line; lineIndex += 1) {
    const line = (lines[lineIndex] ?? "").trim();
    if (/^inputs\s*\{$/i.test(line)) block = true;
    if (block && lineIndex === cursor.line) return true;
    if (block && line === "}") block = false;
  }
  return false;
}
function interpolationStart(line, column) {
  let i = column;
  while (i > 0) {
    const c = line[i - 1] ?? "";
    if (c === "}") return -1;
    if (i >= 2 && line[i - 2] === "$" && c === "{") return i - 2;
    i -= 1;
  }
  return -1;
}
function extractVariableNames(source) {
  try {
    const program3 = parseFlowProgram(source);
    const names = /* @__PURE__ */ new Set();
    for (const input of program3.inputs) {
      if (input.name) names.add(input.name);
    }
    for (const block of [program3.beforeRunProfile, program3.main, program3.afterKillProfile]) {
      for (const stmt of block) {
        if (stmt.type === "assignment" && stmt.name) names.add(stmt.name);
      }
    }
    return Array.from(names).sort().map((name) => ({
      name,
      aliases: [],
      desc: "variable",
      kind: "syntax",
      snippet: name + "}"
    }));
  } catch {
    return [];
  }
}
function firstEmptySlot(snippet) {
  const quoted = snippet.search(/['"]{2}/);
  if (quoted >= 0) return quoted + 1;
  const comma = snippet.indexOf(",");
  if (comma >= 0) return comma;
  const paren = snippet.indexOf("()");
  if (paren >= 0) return paren + 1;
  return snippet.length;
}
function insertAt(lines, cursor, text) {
  const current = lines[cursor.line] ?? "";
  const before = current.slice(0, cursor.column);
  const after = current.slice(cursor.column);
  const parts = text.split("\n");
  if (parts.length === 1) {
    const nextLine = before + (parts[0] ?? "") + after;
    return { lines: lines.map((line, index) => index === cursor.line ? nextLine : line), cursor: { line: cursor.line, column: before.length + text.length } };
  }
  const first = before + (parts[0] ?? "");
  const last = (parts[parts.length - 1] ?? "") + after;
  const middle = parts.slice(1, -1);
  const nextLines = [
    ...lines.slice(0, cursor.line),
    first,
    ...middle,
    last,
    ...lines.slice(cursor.line + 1)
  ];
  return { lines: nextLines, cursor: { line: cursor.line + parts.length - 1, column: (parts[parts.length - 1] ?? "").length } };
}
function replaceToken(lines, cursor, start, snippet) {
  const current = lines[cursor.line] ?? "";
  const before = current.slice(0, start);
  const after = current.slice(cursor.column);
  const insert = insertAt(lines.map((line, index) => index === cursor.line ? before + after : line), { line: cursor.line, column: start }, snippet);
  const slot = firstEmptySlot(snippet);
  const beforeSlot = snippet.slice(0, slot);
  const lineOffset = beforeSlot.split("\n").length - 1;
  const slotColumn = lineOffset === 0 ? start + beforeSlot.length : (beforeSlot.split("\n").pop() ?? "").length;
  return { lines: insert.lines, cursor: { line: cursor.line + lineOffset, column: slotColumn } };
}
function FlowScriptEditor({ filePath, initialSource, onSubmit, onCancel }) {
  const [lines, setLines] = useState(() => splitLines(initialSource));
  const [cursor, setCursor] = useState({ line: 0, column: 0 });
  const [completion, setCompletion] = useState({ open: false, forced: false, cursor: 0 });
  const [error, setError] = useState();
  const lineText = lines[cursor.line] ?? "";
  const rawTokenInfo = currentToken(lineText, cursor.column);
  const insideInterp = isInsideInterpolation(lineText, cursor.column);
  const atDollar = rawTokenInfo.start > 0 && lineText[rawTokenInfo.start - 1] === "$";
  const varContext = insideInterp || atDollar;
  const tokenInfo = varContext && atDollar ? { token: "$" + rawTokenInfo.token, start: rawTokenInfo.start - 1 } : rawTokenInfo;
  const isInputBlock = isInsideInputsBlock(lines, cursor);
  const source = joinLines(lines);
  const completions = useMemo(() => {
    if (!completion.open) return [];
    if (!completion.forced && tokenInfo.token.length === 0) return [];
    if (varContext) {
      const varToken = tokenInfo.token.startsWith("$") ? tokenInfo.token.slice(1).toLowerCase() : tokenInfo.token.toLowerCase();
      const vars = extractVariableNames(source);
      if (!varToken) return vars.slice(0, MAX_COMPLETIONS);
      return vars.filter((v) => v.name.toLowerCase().startsWith(varToken)).slice(0, MAX_COMPLETIONS);
    }
    return getActiveCompletions(tokenInfo.token, isInputBlock).slice(0, MAX_COMPLETIONS);
  }, [completion.open, completion.forced, tokenInfo.token, isInputBlock, varContext, source]);
  const completionOpen = completion.open && completions.length > 0;
  const completionCursor = clamp(completion.cursor, 0, Math.max(completions.length - 1, 0));
  const setCursorClamped = (next, nextLines = lines) => {
    const line = clamp(next.line, 0, nextLines.length - 1);
    const column = clamp(next.column, 0, (nextLines[line] ?? "").length);
    setCursor({ line, column });
  };
  const mutate = (nextLines, nextCursor) => {
    setLines(nextLines);
    setCursorClamped(nextCursor, nextLines);
    setCompletion((current) => ({ ...current, open: false, cursor: 0 }));
    setError(void 0);
  };
  const acceptCompletion = () => {
    const item = completions[completionCursor];
    if (!item) return;
    const next = replaceToken(lines, cursor, tokenInfo.start, item.snippet);
    mutate(next.lines, next.cursor);
  };
  useInput((input, key) => {
    if (key.ctrl && input.toLowerCase() === "s") {
      const source2 = joinLines(lines);
      try {
        parseFlowProgram(source2);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        return;
      }
      onSubmit(source2);
      return;
    }
    if (key.ctrl && input === " ") {
      setCompletion({ open: true, forced: true, cursor: 0 });
      return;
    }
    if (completionOpen && key.upArrow) {
      setCompletion((current) => ({ ...current, cursor: current.cursor <= 0 ? completions.length - 1 : current.cursor - 1 }));
      return;
    }
    if (completionOpen && key.downArrow) {
      setCompletion((current) => ({ ...current, cursor: current.cursor >= completions.length - 1 ? 0 : current.cursor + 1 }));
      return;
    }
    if (completionOpen && (key.return || key.tab)) {
      acceptCompletion();
      return;
    }
    if (key.escape) {
      if (completion.open) {
        setCompletion((current) => ({ ...current, open: false, forced: false, cursor: 0 }));
        return;
      }
      onCancel();
      return;
    }
    if (key.upArrow) {
      setCursorClamped({ line: cursor.line - 1, column: cursor.column });
      setCompletion((current) => ({ ...current, open: false }));
      return;
    }
    if (key.downArrow) {
      setCursorClamped({ line: cursor.line + 1, column: cursor.column });
      setCompletion((current) => ({ ...current, open: false }));
      return;
    }
    if (key.leftArrow) {
      if (cursor.column > 0) setCursorClamped({ line: cursor.line, column: cursor.column - 1 });
      else if (cursor.line > 0) setCursorClamped({ line: cursor.line - 1, column: (lines[cursor.line - 1] ?? "").length });
      setCompletion((current) => ({ ...current, open: false }));
      return;
    }
    if (key.rightArrow) {
      const current = lines[cursor.line] ?? "";
      if (cursor.column < current.length) setCursorClamped({ line: cursor.line, column: cursor.column + 1 });
      else if (cursor.line < lines.length - 1) setCursorClamped({ line: cursor.line + 1, column: 0 });
      setCompletion((currentState) => ({ ...currentState, open: false }));
      return;
    }
    const isDeleteKey = key.sequence === "\x1B[3~";
    const isBackspaceKey = key.backspace || input === "\b" || input === String.fromCharCode(127) || key.delete && !isDeleteKey;
    if (isBackspaceKey) {
      if (cursor.column > 0) {
        const current = lines[cursor.line] ?? "";
        const nextLines = lines.map((line, index) => index === cursor.line ? current.slice(0, cursor.column - 1) + current.slice(cursor.column) : line);
        mutate(nextLines, { line: cursor.line, column: cursor.column - 1 });
      } else if (cursor.line > 0) {
        const previous = lines[cursor.line - 1] ?? "";
        const current = lines[cursor.line] ?? "";
        const nextLines = [...lines.slice(0, cursor.line - 1), previous + current, ...lines.slice(cursor.line + 1)];
        mutate(nextLines, { line: cursor.line - 1, column: previous.length });
      }
      return;
    }
    if (isDeleteKey) {
      const current = lines[cursor.line] ?? "";
      if (cursor.column < current.length) {
        const nextLines = lines.map((line, index) => index === cursor.line ? current.slice(0, cursor.column) + current.slice(cursor.column + 1) : line);
        mutate(nextLines, cursor);
      } else if (cursor.line < lines.length - 1) {
        const nextLines = [...lines.slice(0, cursor.line), current + (lines[cursor.line + 1] ?? ""), ...lines.slice(cursor.line + 2)];
        mutate(nextLines, cursor);
      }
      return;
    }
    if (key.return) {
      const current = lines[cursor.line] ?? "";
      const indent = current.match(/^\s*/)?.[0] ?? "";
      const extraIndent = current.trim().endsWith("{") ? "  " : "";
      const nextLines = [...lines.slice(0, cursor.line), current.slice(0, cursor.column), indent + extraIndent + current.slice(cursor.column), ...lines.slice(cursor.line + 1)];
      mutate(nextLines, { line: cursor.line + 1, column: indent.length + extraIndent.length });
      return;
    }
    if (key.tab) {
      const next = insertAt(lines, cursor, "  ");
      mutate(next.lines, next.cursor);
      return;
    }
    if (input) {
      const next = insertAt(lines, cursor, input);
      setLines(next.lines);
      setCursorClamped(next.cursor, next.lines);
      setError(void 0);
      if (input === "$") setCompletion({ open: true, forced: true, cursor: 0 });
      else if (/^[A-Za-z0-9_-]+$/.test(input)) setCompletion({ open: true, forced: false, cursor: 0 });
      else setCompletion((current) => ({ ...current, open: false, cursor: 0 }));
    }
  });
  return /* @__PURE__ */ jsxs(Box, { flexDirection: "column", children: [
    /* @__PURE__ */ jsxs(Text, { color: uiTheme.accent, children: [
      "Create flow script: ",
      filePath
    ] }),
    /* @__PURE__ */ jsx(Text, { children: " " }),
    lines.map((line, index) => {
      const lineNo = String(index + 1).padStart(3, " ");
      const isCursorLine = index === cursor.line;
      const before = isCursorLine ? line.slice(0, cursor.column) : line;
      const under = isCursorLine ? line[cursor.column] ?? " " : "";
      const after = isCursorLine ? line.slice(cursor.column + (line[cursor.column] ? 1 : 0)) : "";
      return /* @__PURE__ */ jsxs(Text, { children: [
        /* @__PURE__ */ jsxs(Text, { color: uiTheme.muted, children: [
          lineNo,
          " \u2502 "
        ] }),
        isCursorLine ? /* @__PURE__ */ jsxs(Fragment, { children: [
          before,
          /* @__PURE__ */ jsx(Text, { inverse: true, children: under }),
          after
        ] }) : line
      ] }, `${index}-${line}`);
    }),
    completionOpen ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Text, { children: " " }),
      /* @__PURE__ */ jsx(Text, { color: uiTheme.accent, children: "Autocomplete" }),
      completions.map((item, index) => /* @__PURE__ */ jsxs(Text, { color: index === completionCursor ? uiTheme.accent : void 0, inverse: index === completionCursor, children: [
        index === completionCursor ? "> " : "  ",
        item.name,
        " ",
        /* @__PURE__ */ jsx(Text, { color: uiTheme.muted, children: item.desc })
      ] }, `${item.kind}-${item.name}`))
    ] }) : null,
    error ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Text, { children: " " }),
      /* @__PURE__ */ jsx(Text, { color: uiTheme.error, children: error })
    ] }) : null,
    /* @__PURE__ */ jsx(Text, { children: " " }),
    /* @__PURE__ */ jsx(Text, { color: uiTheme.muted, children: "[Ctrl+S] save   [Esc] cancel/close autocomplete   [Tab/Enter] complete   [\u2191\u2193] move   [Ctrl+Space] suggestions" })
  ] });
}
async function runFlowScriptEditor(args) {
  return runInkPrompt((props) => /* @__PURE__ */ jsx(FlowScriptEditor, { ...args, ...props }));
}
var MAX_COMPLETIONS;
var init_flow_script_editor = __esm({
  "src/ui/flow-script-editor.tsx"() {
    "use strict";
    init_stub_react();
    init_stub_ink();
    init_parser();
    init_catalog();
    init_ink_runner();
    init_ui_theme();
    init_stub_react();
    MAX_COMPLETIONS = 8;
  }
});

// src/ui/ui-ink.ts
var ui_ink_exports = {};
__export(ui_ink_exports, {
  inkUi: () => inkUi
});
var inkUi;
var init_ui_ink = __esm({
  "src/ui/ui-ink.ts"() {
    "use strict";
    init_list_picker();
    init_text_input_prompt();
    init_update_prompt();
    init_flow_script_editor();
    inkUi = {
      async runListPicker(args) {
        return runListPicker(args);
      },
      async runTextInputPrompt(args) {
        return runTextInputPrompt(args);
      },
      async runUpdatePrompt(update) {
        return runUpdatePrompt(update);
      },
      async runFlowScriptEditor(args) {
        return runFlowScriptEditor(args);
      }
    };
  }
});

// node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/constants.js"(exports, module) {
    "use strict";
    var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob) BINARY_TYPES.push("blob");
    module.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 3e4,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: /* @__PURE__ */ Symbol("kIsForOnEventAttribute"),
      kListener: /* @__PURE__ */ Symbol("kListener"),
      kStatusCode: /* @__PURE__ */ Symbol("status-code"),
      kWebSocket: /* @__PURE__ */ Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/buffer-util.js"(exports, module) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0) return EMPTY_BUFFER;
      if (list.length === 1) return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data)) return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = __require("bufferutil");
        module.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48) _mask(source, mask, output, offset, length);
          else bufferUtil.mask(source, mask, output, offset, length);
        };
        module.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32) _unmask(buffer, mask);
          else bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/limiter.js"(exports, module) {
    "use strict";
    var kDone = /* @__PURE__ */ Symbol("kDone");
    var kRun = /* @__PURE__ */ Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency) return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module.exports = Limiter;
  }
});

// node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/permessage-deflate.js"(exports, module) {
    "use strict";
    var zlib = __require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = /* @__PURE__ */ Symbol("permessage-deflate");
    var kTotalLength = /* @__PURE__ */ Symbol("total-length");
    var kCallback = /* @__PURE__ */ Symbol("callback");
    var kBuffers = /* @__PURE__ */ Symbol("buffers");
    var kError = /* @__PURE__ */ Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate2 = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {Boolean} [options.isServer=false] Create the instance in either
       *     server or client mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       */
      constructor(options) {
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = !!this._options.isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin) this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module.exports = PerMessageDeflate2;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      if (this[kError]) {
        this[kCallback](this[kError]);
        return;
      }
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/validation.js"(exports, module) {
    "use strict";
    var { isUtf8 } = __require("buffer");
    var { hasBlob } = require_constants();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
    }
    module.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = __require("utf-8-validate");
        module.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/receiver.js"(exports, module) {
    "use strict";
    var { Writable } = __require("stream");
    var PerMessageDeflate2 = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxBufferedChunks = options.maxBufferedChunks | 0;
        this._maxFragments = options.maxFragments | 0;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO) return cb();
        if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
          cb(
            this.createError(
              RangeError,
              "Too many buffered chunks",
              false,
              1008,
              "WS_ERR_TOO_MANY_BUFFERED_PARTS"
            )
          );
          return;
        }
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length) return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored) cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate2.extensionName]) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (!this._fragmented) {
            const error = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error);
            return;
          }
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error);
            return;
          }
        } else {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error);
            return;
          }
        } else if (this._masked) {
          const error = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error);
          return;
        }
        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error);
            return;
          }
        }
        if (this._masked) this._state = GET_MASK;
        else this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          if (this._maxFragments > 0 && this._fragments.length >= this._maxFragments) {
            const error = this.createError(
              RangeError,
              "Too many message fragments",
              false,
              1008,
              "WS_ERR_TOO_MANY_BUFFERED_PARTS"
            );
            cb(error);
            return;
          }
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err) return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error);
              return;
            }
            if (this._maxFragments > 0 && this._fragments.length >= this._maxFragments) {
              const error = this.createError(
                RangeError,
                "Too many message fragments",
                false,
                1008,
                "WS_ERR_TOO_MANY_BUFFERED_PARTS"
              );
              cb(error);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO) this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              const error = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error);
              return;
            }
            this._loop = false;
            this.emit("conclude", code, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module.exports = Receiver2;
  }
});

// node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/sender.js"(exports, module) {
    "use strict";
    var { Duplex } = __require("stream");
    var { randomFillSync } = __require("crypto");
    var {
      types: { isUint8Array }
    } = __require("util");
    var PerMessageDeflate2 = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = /* @__PURE__ */ Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1) target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask) return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking) return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else if (isUint8Array(data)) {
            buf.set(data, 2);
          } else {
            throw new TypeError("Second argument must be a string or a Uint8Array");
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin) this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress, options, cb) {
        this._bufferedBytes += options[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while the blob was being read"
            );
            process.nextTick(callCallbacks, this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          const data = toBuffer(arrayBuffer);
          if (!compress) {
            this._state = DEFAULT;
            this.sendFrame(_Sender.frame(data, options), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress, options, cb);
          }
        }).catch((err) => {
          process.nextTick(onError, this, err, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            callCallbacks(this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._state = DEFAULT;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {(Buffer | String)[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module.exports = Sender2;
    function callCallbacks(sender, err, cb) {
      if (typeof cb === "function") cb(err);
      for (let i = 0; i < sender._queue.length; i++) {
        const params = sender._queue[i];
        const callback = params[params.length - 1];
        if (typeof callback === "function") callback(err);
      }
    }
    function onError(sender, err, cb) {
      callCallbacks(sender, err, cb);
      sender.onerror(err);
    }
  }
});

// node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/event-target.js"(exports, module) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = /* @__PURE__ */ Symbol("kCode");
    var kData = /* @__PURE__ */ Symbol("kData");
    var kError = /* @__PURE__ */ Symbol("kError");
    var kMessage = /* @__PURE__ */ Symbol("kMessage");
    var kReason = /* @__PURE__ */ Symbol("kReason");
    var kTarget = /* @__PURE__ */ Symbol("kTarget");
    var kType = /* @__PURE__ */ Symbol("kType");
    var kWasClean = /* @__PURE__ */ Symbol("kWasClean");
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/extension.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0) dest[name] = [elem];
      else dest[name].push(elem);
    }
    function parse2(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1) start = i;
            else if (!mustUnescape) mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1) start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1) end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension2) => {
        let configurations = extensions[extension2];
        if (!Array.isArray(configurations)) configurations = [configurations];
        return configurations.map((params) => {
          return [extension2].concat(
            Object.keys(params).map((k) => {
              let values = params[k];
              if (!Array.isArray(values)) values = [values];
              return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module.exports = { format, parse: parse2 };
  }
});

// node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/websocket.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var https = __require("https");
    var http = __require("http");
    var net = __require("net");
    var tls = __require("tls");
    var { randomBytes: randomBytes2, createHash: createHash2 } = __require("crypto");
    var { Duplex, Readable: Readable2 } = __require("stream");
    var { URL: URL2 } = __require("url");
    var PerMessageDeflate2 = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var {
      BINARY_TYPES,
      CLOSE_TIMEOUT,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse: parse2 } = require_extension();
    var { toBuffer } = require_buffer_util();
    var kAborted = /* @__PURE__ */ Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._closeTimeout = options.closeTimeout;
          this._isServer = true;
        }
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type)) return;
        this._binaryType = type;
        if (this._receiver) this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxBufferedChunks: options.maxBufferedChunks,
          maxFragments: options.maxFragments,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout) socket.setTimeout(0);
        if (socket.setNoDelay) socket.setNoDelay();
        if (head.length > 0) socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate2.extensionName]) {
          this._extensions[PerMessageDeflate2.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _WebSocket.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err) return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate2.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function") return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        closeTimeout: CLOSE_TIMEOUT,
        protocolVersion: protocolVersions[1],
        maxBufferedChunks: 1024 * 1024,
        maxFragments: 128 * 1024,
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      websocket._closeTimeout = opts.closeTimeout;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL2) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL2(address);
        } catch {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes2(16).toString("base64");
      const request = isSecure ? https.request : http.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate2({
          ...opts.perMessageDeflate,
          isServer: false,
          maxPayload: opts.maxPayload
        });
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate2.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost) delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted]) return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL2(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING) return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash2("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt) websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse2(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate2.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate2.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxBufferedChunks: opts.maxBufferedChunks,
          maxFragments: opts.maxFragments,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;
        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0) return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005) websocket.close();
      else websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused) websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function senderOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket2.CLOSED) return;
      if (websocket.readyState === WebSocket2.OPEN) {
        websocket._readyState = WebSocket2.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        websocket._closeTimeout
      );
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
        const chunk = this.read(this._readableState.length);
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});

// node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/stream.js"(exports, module) {
    "use strict";
    var WebSocket2 = require_websocket();
    var { Duplex } = __require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data)) ws.pause();
      });
      ws.once("error", function error(err) {
        if (duplex.destroyed) return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed) return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called) callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy) ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null) return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted) duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused) ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module.exports = createWebSocketStream2;
  }
});

// node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/subprotocol.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse2(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1) end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module.exports = { parse: parse2 };
  }
});

// node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "node_modules/.pnpm/ws@8.21.0/node_modules/ws/lib/websocket-server.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var http = __require("http");
    var { Duplex } = __require("stream");
    var { createHash: createHash2 } = __require("crypto");
    var extension2 = require_extension();
    var PerMessageDeflate2 = require_permessage_deflate();
    var subprotocol2 = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
       *     wait for the closing handshake to finish after `websocket.close()` is
       *     called
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxBufferedChunks=1048576] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=131072] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxBufferedChunks: 1024 * 1024,
          maxFragments: 128 * 1024,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          closeTimeout: CLOSE_TIMEOUT,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http.createServer((req, res) => {
            const body = http.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true) options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server) return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb) this.once("close", cb);
        if (this._state === CLOSING) return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path) return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version !== 13 && version !== 8) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
            "Sec-WebSocket-Version": "13, 8"
          });
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol2.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate2({
            ...this.options.perMessageDeflate,
            isServer: true,
            maxPayload: this.options.maxPayload
          });
          try {
            const offers = extension2.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate2.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate2.extensionName]);
              extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable) return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING) return abortHandshake(socket, 503);
        const digest = createHash2("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate2.extensionName]) {
          const params = extensions[PerMessageDeflate2.extensionName].params;
          const value = extension2.format({
            [PerMessageDeflate2.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxBufferedChunks: this.options.maxBufferedChunks,
          maxFragments: this.options.maxFragments,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module.exports = WebSocketServer2;
    function addListeners(server, map) {
      for (const event of Object.keys(map)) server.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message, headers);
      }
    }
  }
});

// node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js
var require_main2 = __commonJS({
  "node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var node_exports = {};
    __export2(node_exports, {
      analyzeMetafile: () => analyzeMetafile,
      analyzeMetafileSync: () => analyzeMetafileSync,
      build: () => build,
      buildSync: () => buildSync,
      context: () => context,
      default: () => node_default,
      formatMessages: () => formatMessages,
      formatMessagesSync: () => formatMessagesSync,
      initialize: () => initialize,
      stop: () => stop,
      transform: () => transform,
      transformSync: () => transformSync,
      version: () => version
    });
    module.exports = __toCommonJS(node_exports);
    function encodePacket(packet) {
      let visit = (value) => {
        if (value === null) {
          bb.write8(0);
        } else if (typeof value === "boolean") {
          bb.write8(1);
          bb.write8(+value);
        } else if (typeof value === "number") {
          bb.write8(2);
          bb.write32(value | 0);
        } else if (typeof value === "string") {
          bb.write8(3);
          bb.write(encodeUTF8(value));
        } else if (value instanceof Uint8Array) {
          bb.write8(4);
          bb.write(value);
        } else if (value instanceof Array) {
          bb.write8(5);
          bb.write32(value.length);
          for (let item of value) {
            visit(item);
          }
        } else {
          let keys = Object.keys(value);
          bb.write8(6);
          bb.write32(keys.length);
          for (let key of keys) {
            bb.write(encodeUTF8(key));
            visit(value[key]);
          }
        }
      };
      let bb = new ByteBuffer();
      bb.write32(0);
      bb.write32(packet.id << 1 | +!packet.isRequest);
      visit(packet.value);
      writeUInt32LE(bb.buf, bb.len - 4, 0);
      return bb.buf.subarray(0, bb.len);
    }
    function decodePacket(bytes) {
      let visit = () => {
        switch (bb.read8()) {
          case 0:
            return null;
          case 1:
            return !!bb.read8();
          case 2:
            return bb.read32();
          case 3:
            return decodeUTF8(bb.read());
          case 4:
            return bb.read();
          case 5: {
            let count = bb.read32();
            let value2 = [];
            for (let i = 0; i < count; i++) {
              value2.push(visit());
            }
            return value2;
          }
          case 6: {
            let count = bb.read32();
            let value2 = {};
            for (let i = 0; i < count; i++) {
              value2[decodeUTF8(bb.read())] = visit();
            }
            return value2;
          }
          default:
            throw new Error("Invalid packet");
        }
      };
      let bb = new ByteBuffer(bytes);
      let id = bb.read32();
      let isRequest = (id & 1) === 0;
      id >>>= 1;
      let value = visit();
      if (bb.ptr !== bytes.length) {
        throw new Error("Invalid packet");
      }
      return { id, isRequest, value };
    }
    var ByteBuffer = class {
      constructor(buf = new Uint8Array(1024)) {
        this.buf = buf;
        this.len = 0;
        this.ptr = 0;
      }
      _write(delta) {
        if (this.len + delta > this.buf.length) {
          let clone = new Uint8Array((this.len + delta) * 2);
          clone.set(this.buf);
          this.buf = clone;
        }
        this.len += delta;
        return this.len - delta;
      }
      write8(value) {
        let offset = this._write(1);
        this.buf[offset] = value;
      }
      write32(value) {
        let offset = this._write(4);
        writeUInt32LE(this.buf, value, offset);
      }
      write(bytes) {
        let offset = this._write(4 + bytes.length);
        writeUInt32LE(this.buf, bytes.length, offset);
        this.buf.set(bytes, offset + 4);
      }
      _read(delta) {
        if (this.ptr + delta > this.buf.length) {
          throw new Error("Invalid packet");
        }
        this.ptr += delta;
        return this.ptr - delta;
      }
      read8() {
        return this.buf[this._read(1)];
      }
      read32() {
        return readUInt32LE(this.buf, this._read(4));
      }
      read() {
        let length = this.read32();
        let bytes = new Uint8Array(length);
        let ptr = this._read(bytes.length);
        bytes.set(this.buf.subarray(ptr, ptr + length));
        return bytes;
      }
    };
    var encodeUTF8;
    var decodeUTF8;
    var encodeInvariant;
    if (typeof TextEncoder !== "undefined" && typeof TextDecoder !== "undefined") {
      let encoder = new TextEncoder();
      let decoder = new TextDecoder();
      encodeUTF8 = (text) => encoder.encode(text);
      decodeUTF8 = (bytes) => decoder.decode(bytes);
      encodeInvariant = 'new TextEncoder().encode("")';
    } else if (typeof Buffer !== "undefined") {
      encodeUTF8 = (text) => Buffer.from(text);
      decodeUTF8 = (bytes) => {
        let { buffer, byteOffset, byteLength } = bytes;
        return Buffer.from(buffer, byteOffset, byteLength).toString();
      };
      encodeInvariant = 'Buffer.from("")';
    } else {
      throw new Error("No UTF-8 codec found");
    }
    if (!(encodeUTF8("") instanceof Uint8Array))
      throw new Error(`Invariant violation: "${encodeInvariant} instanceof Uint8Array" is incorrectly false

This indicates that your JavaScript environment is broken. You cannot use
esbuild in this environment because esbuild relies on this invariant. This
is not a problem with esbuild. You need to fix your environment instead.
`);
    function readUInt32LE(buffer, offset) {
      return (buffer[offset++] | buffer[offset++] << 8 | buffer[offset++] << 16 | buffer[offset++] << 24) >>> 0;
    }
    function writeUInt32LE(buffer, value, offset) {
      buffer[offset++] = value;
      buffer[offset++] = value >> 8;
      buffer[offset++] = value >> 16;
      buffer[offset++] = value >> 24;
    }
    var fromCharCode = String.fromCharCode;
    function throwSyntaxError(bytes, index, message) {
      const c = bytes[index];
      let line = 1;
      let column = 0;
      for (let i = 0; i < index; i++) {
        if (bytes[i] === 10) {
          line++;
          column = 0;
        } else {
          column++;
        }
      }
      throw new SyntaxError(
        message ? message : index === bytes.length ? "Unexpected end of input while parsing JSON" : c >= 32 && c <= 126 ? `Unexpected character ${fromCharCode(c)} in JSON at position ${index} (line ${line}, column ${column})` : `Unexpected byte 0x${c.toString(16)} in JSON at position ${index} (line ${line}, column ${column})`
      );
    }
    function JSON_parse(bytes) {
      if (!(bytes instanceof Uint8Array)) {
        throw new Error(`JSON input must be a Uint8Array`);
      }
      const propertyStack = [];
      const objectStack = [];
      const stateStack = [];
      const length = bytes.length;
      let property = null;
      let state = 0;
      let object;
      let i = 0;
      while (i < length) {
        let c = bytes[i++];
        if (c <= 32) {
          continue;
        }
        let value;
        if (state === 2 && property === null && c !== 34 && c !== 125) {
          throwSyntaxError(bytes, --i);
        }
        switch (c) {
          // True
          case 116: {
            if (bytes[i++] !== 114 || bytes[i++] !== 117 || bytes[i++] !== 101) {
              throwSyntaxError(bytes, --i);
            }
            value = true;
            break;
          }
          // False
          case 102: {
            if (bytes[i++] !== 97 || bytes[i++] !== 108 || bytes[i++] !== 115 || bytes[i++] !== 101) {
              throwSyntaxError(bytes, --i);
            }
            value = false;
            break;
          }
          // Null
          case 110: {
            if (bytes[i++] !== 117 || bytes[i++] !== 108 || bytes[i++] !== 108) {
              throwSyntaxError(bytes, --i);
            }
            value = null;
            break;
          }
          // Number begin
          case 45:
          case 46:
          case 48:
          case 49:
          case 50:
          case 51:
          case 52:
          case 53:
          case 54:
          case 55:
          case 56:
          case 57: {
            let index = i;
            value = fromCharCode(c);
            c = bytes[i];
            while (true) {
              switch (c) {
                case 43:
                case 45:
                case 46:
                case 48:
                case 49:
                case 50:
                case 51:
                case 52:
                case 53:
                case 54:
                case 55:
                case 56:
                case 57:
                case 101:
                case 69: {
                  value += fromCharCode(c);
                  c = bytes[++i];
                  continue;
                }
              }
              break;
            }
            value = +value;
            if (isNaN(value)) {
              throwSyntaxError(bytes, --index, "Invalid number");
            }
            break;
          }
          // String begin
          case 34: {
            value = "";
            while (true) {
              if (i >= length) {
                throwSyntaxError(bytes, length);
              }
              c = bytes[i++];
              if (c === 34) {
                break;
              } else if (c === 92) {
                switch (bytes[i++]) {
                  // Normal escape sequence
                  case 34:
                    value += '"';
                    break;
                  case 47:
                    value += "/";
                    break;
                  case 92:
                    value += "\\";
                    break;
                  case 98:
                    value += "\b";
                    break;
                  case 102:
                    value += "\f";
                    break;
                  case 110:
                    value += "\n";
                    break;
                  case 114:
                    value += "\r";
                    break;
                  case 116:
                    value += "	";
                    break;
                  // Unicode escape sequence
                  case 117: {
                    let code = 0;
                    for (let j = 0; j < 4; j++) {
                      c = bytes[i++];
                      code <<= 4;
                      if (c >= 48 && c <= 57) code |= c - 48;
                      else if (c >= 97 && c <= 102) code |= c + (10 - 97);
                      else if (c >= 65 && c <= 70) code |= c + (10 - 65);
                      else throwSyntaxError(bytes, --i);
                    }
                    value += fromCharCode(code);
                    break;
                  }
                  // Invalid escape sequence
                  default:
                    throwSyntaxError(bytes, --i);
                    break;
                }
              } else if (c <= 127) {
                value += fromCharCode(c);
              } else if ((c & 224) === 192) {
                value += fromCharCode((c & 31) << 6 | bytes[i++] & 63);
              } else if ((c & 240) === 224) {
                value += fromCharCode((c & 15) << 12 | (bytes[i++] & 63) << 6 | bytes[i++] & 63);
              } else if ((c & 248) == 240) {
                let codePoint = (c & 7) << 18 | (bytes[i++] & 63) << 12 | (bytes[i++] & 63) << 6 | bytes[i++] & 63;
                if (codePoint > 65535) {
                  codePoint -= 65536;
                  value += fromCharCode(codePoint >> 10 & 1023 | 55296);
                  codePoint = 56320 | codePoint & 1023;
                }
                value += fromCharCode(codePoint);
              }
            }
            value[0];
            break;
          }
          // Array begin
          case 91: {
            value = [];
            propertyStack.push(property);
            objectStack.push(object);
            stateStack.push(state);
            property = null;
            object = value;
            state = 1;
            continue;
          }
          // Object begin
          case 123: {
            value = {};
            propertyStack.push(property);
            objectStack.push(object);
            stateStack.push(state);
            property = null;
            object = value;
            state = 2;
            continue;
          }
          // Array end
          case 93: {
            if (state !== 1) {
              throwSyntaxError(bytes, --i);
            }
            value = object;
            property = propertyStack.pop();
            object = objectStack.pop();
            state = stateStack.pop();
            break;
          }
          // Object end
          case 125: {
            if (state !== 2) {
              throwSyntaxError(bytes, --i);
            }
            value = object;
            property = propertyStack.pop();
            object = objectStack.pop();
            state = stateStack.pop();
            break;
          }
          default: {
            throwSyntaxError(bytes, --i);
          }
        }
        c = bytes[i];
        while (c <= 32) {
          c = bytes[++i];
        }
        switch (state) {
          case 0: {
            if (i === length) {
              return value;
            }
            break;
          }
          case 1: {
            object.push(value);
            if (c === 44) {
              i++;
              continue;
            }
            if (c === 93) {
              continue;
            }
            break;
          }
          case 2: {
            if (property === null) {
              property = value;
              if (c === 58) {
                i++;
                continue;
              }
            } else {
              object[property] = value;
              property = null;
              if (c === 44) {
                i++;
                continue;
              }
              if (c === 125) {
                continue;
              }
            }
            break;
          }
        }
        break;
      }
      throwSyntaxError(bytes, i);
    }
    var quote = JSON.stringify;
    var buildLogLevelDefault = "warning";
    var transformLogLevelDefault = "silent";
    function validateAndJoinStringArray(values, what) {
      const toJoin = [];
      for (const value of values) {
        validateStringValue(value, what);
        if (value.indexOf(",") >= 0) throw new Error(`Invalid ${what}: ${value}`);
        toJoin.push(value);
      }
      return toJoin.join(",");
    }
    var canBeAnything = () => null;
    var mustBeBoolean = (value) => typeof value === "boolean" ? null : "a boolean";
    var mustBeString = (value) => typeof value === "string" ? null : "a string";
    var mustBeRegExp = (value) => value instanceof RegExp ? null : "a RegExp object";
    var mustBeInteger = (value) => typeof value === "number" && value === (value | 0) ? null : "an integer";
    var mustBeValidPortNumber = (value) => typeof value === "number" && value === (value | 0) && value >= 0 && value <= 65535 ? null : "a valid port number";
    var mustBeFunction = (value) => typeof value === "function" ? null : "a function";
    var mustBeArray = (value) => Array.isArray(value) ? null : "an array";
    var mustBeArrayOfStrings = (value) => Array.isArray(value) && value.every((x) => typeof x === "string") ? null : "an array of strings";
    var mustBeObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value) ? null : "an object";
    var mustBeEntryPoints = (value) => typeof value === "object" && value !== null ? null : "an array or an object";
    var mustBeWebAssemblyModule = (value) => value instanceof WebAssembly.Module ? null : "a WebAssembly.Module";
    var mustBeObjectOrNull = (value) => typeof value === "object" && !Array.isArray(value) ? null : "an object or null";
    var mustBeStringOrBoolean = (value) => typeof value === "string" || typeof value === "boolean" ? null : "a string or a boolean";
    var mustBeStringOrObject = (value) => typeof value === "string" || typeof value === "object" && value !== null && !Array.isArray(value) ? null : "a string or an object";
    var mustBeStringOrArrayOfStrings = (value) => typeof value === "string" || Array.isArray(value) && value.every((x) => typeof x === "string") ? null : "a string or an array of strings";
    var mustBeStringOrUint8Array = (value) => typeof value === "string" || value instanceof Uint8Array ? null : "a string or a Uint8Array";
    var mustBeStringOrURL = (value) => typeof value === "string" || value instanceof URL ? null : "a string or a URL";
    function getFlag(object, keys, key, mustBeFn) {
      let value = object[key];
      keys[key + ""] = true;
      if (value === void 0) return void 0;
      let mustBe = mustBeFn(value);
      if (mustBe !== null) throw new Error(`${quote(key)} must be ${mustBe}`);
      return value;
    }
    function checkForInvalidFlags(object, keys, where) {
      for (let key in object) {
        if (!(key in keys)) {
          throw new Error(`Invalid option ${where}: ${quote(key)}`);
        }
      }
    }
    function validateInitializeOptions(options) {
      let keys = /* @__PURE__ */ Object.create(null);
      let wasmURL = getFlag(options, keys, "wasmURL", mustBeStringOrURL);
      let wasmModule = getFlag(options, keys, "wasmModule", mustBeWebAssemblyModule);
      let worker = getFlag(options, keys, "worker", mustBeBoolean);
      checkForInvalidFlags(options, keys, "in initialize() call");
      return {
        wasmURL,
        wasmModule,
        worker
      };
    }
    function validateMangleCache(mangleCache) {
      let validated;
      if (mangleCache !== void 0) {
        validated = /* @__PURE__ */ Object.create(null);
        for (let key in mangleCache) {
          let value = mangleCache[key];
          if (typeof value === "string" || value === false) {
            validated[key] = value;
          } else {
            throw new Error(`Expected ${quote(key)} in mangle cache to map to either a string or false`);
          }
        }
      }
      return validated;
    }
    function pushLogFlags(flags, options, keys, isTTY2, logLevelDefault) {
      let color = getFlag(options, keys, "color", mustBeBoolean);
      let logLevel = getFlag(options, keys, "logLevel", mustBeString);
      let logLimit = getFlag(options, keys, "logLimit", mustBeInteger);
      if (color !== void 0) flags.push(`--color=${color}`);
      else if (isTTY2) flags.push(`--color=true`);
      flags.push(`--log-level=${logLevel || logLevelDefault}`);
      flags.push(`--log-limit=${logLimit || 0}`);
    }
    function validateStringValue(value, what, key) {
      if (typeof value !== "string") {
        throw new Error(`Expected value for ${what}${key !== void 0 ? " " + quote(key) : ""} to be a string, got ${typeof value} instead`);
      }
      return value;
    }
    function pushCommonFlags(flags, options, keys) {
      let legalComments = getFlag(options, keys, "legalComments", mustBeString);
      let sourceRoot = getFlag(options, keys, "sourceRoot", mustBeString);
      let sourcesContent = getFlag(options, keys, "sourcesContent", mustBeBoolean);
      let target = getFlag(options, keys, "target", mustBeStringOrArrayOfStrings);
      let format = getFlag(options, keys, "format", mustBeString);
      let globalName = getFlag(options, keys, "globalName", mustBeString);
      let mangleProps = getFlag(options, keys, "mangleProps", mustBeRegExp);
      let reserveProps = getFlag(options, keys, "reserveProps", mustBeRegExp);
      let mangleQuoted = getFlag(options, keys, "mangleQuoted", mustBeBoolean);
      let minify = getFlag(options, keys, "minify", mustBeBoolean);
      let minifySyntax = getFlag(options, keys, "minifySyntax", mustBeBoolean);
      let minifyWhitespace = getFlag(options, keys, "minifyWhitespace", mustBeBoolean);
      let minifyIdentifiers = getFlag(options, keys, "minifyIdentifiers", mustBeBoolean);
      let lineLimit = getFlag(options, keys, "lineLimit", mustBeInteger);
      let drop = getFlag(options, keys, "drop", mustBeArrayOfStrings);
      let dropLabels = getFlag(options, keys, "dropLabels", mustBeArrayOfStrings);
      let charset = getFlag(options, keys, "charset", mustBeString);
      let treeShaking = getFlag(options, keys, "treeShaking", mustBeBoolean);
      let ignoreAnnotations = getFlag(options, keys, "ignoreAnnotations", mustBeBoolean);
      let jsx2 = getFlag(options, keys, "jsx", mustBeString);
      let jsxFactory = getFlag(options, keys, "jsxFactory", mustBeString);
      let jsxFragment = getFlag(options, keys, "jsxFragment", mustBeString);
      let jsxImportSource = getFlag(options, keys, "jsxImportSource", mustBeString);
      let jsxDev = getFlag(options, keys, "jsxDev", mustBeBoolean);
      let jsxSideEffects = getFlag(options, keys, "jsxSideEffects", mustBeBoolean);
      let define = getFlag(options, keys, "define", mustBeObject);
      let logOverride = getFlag(options, keys, "logOverride", mustBeObject);
      let supported = getFlag(options, keys, "supported", mustBeObject);
      let pure = getFlag(options, keys, "pure", mustBeArrayOfStrings);
      let keepNames = getFlag(options, keys, "keepNames", mustBeBoolean);
      let platform = getFlag(options, keys, "platform", mustBeString);
      let tsconfigRaw = getFlag(options, keys, "tsconfigRaw", mustBeStringOrObject);
      let absPaths = getFlag(options, keys, "absPaths", mustBeArrayOfStrings);
      if (legalComments) flags.push(`--legal-comments=${legalComments}`);
      if (sourceRoot !== void 0) flags.push(`--source-root=${sourceRoot}`);
      if (sourcesContent !== void 0) flags.push(`--sources-content=${sourcesContent}`);
      if (target) flags.push(`--target=${validateAndJoinStringArray(Array.isArray(target) ? target : [target], "target")}`);
      if (format) flags.push(`--format=${format}`);
      if (globalName) flags.push(`--global-name=${globalName}`);
      if (platform) flags.push(`--platform=${platform}`);
      if (tsconfigRaw) flags.push(`--tsconfig-raw=${typeof tsconfigRaw === "string" ? tsconfigRaw : JSON.stringify(tsconfigRaw)}`);
      if (minify) flags.push("--minify");
      if (minifySyntax) flags.push("--minify-syntax");
      if (minifyWhitespace) flags.push("--minify-whitespace");
      if (minifyIdentifiers) flags.push("--minify-identifiers");
      if (lineLimit) flags.push(`--line-limit=${lineLimit}`);
      if (charset) flags.push(`--charset=${charset}`);
      if (treeShaking !== void 0) flags.push(`--tree-shaking=${treeShaking}`);
      if (ignoreAnnotations) flags.push(`--ignore-annotations`);
      if (drop) for (let what of drop) flags.push(`--drop:${validateStringValue(what, "drop")}`);
      if (dropLabels) flags.push(`--drop-labels=${validateAndJoinStringArray(dropLabels, "drop label")}`);
      if (absPaths) flags.push(`--abs-paths=${validateAndJoinStringArray(absPaths, "abs paths")}`);
      if (mangleProps) flags.push(`--mangle-props=${jsRegExpToGoRegExp(mangleProps)}`);
      if (reserveProps) flags.push(`--reserve-props=${jsRegExpToGoRegExp(reserveProps)}`);
      if (mangleQuoted !== void 0) flags.push(`--mangle-quoted=${mangleQuoted}`);
      if (jsx2) flags.push(`--jsx=${jsx2}`);
      if (jsxFactory) flags.push(`--jsx-factory=${jsxFactory}`);
      if (jsxFragment) flags.push(`--jsx-fragment=${jsxFragment}`);
      if (jsxImportSource) flags.push(`--jsx-import-source=${jsxImportSource}`);
      if (jsxDev) flags.push(`--jsx-dev`);
      if (jsxSideEffects) flags.push(`--jsx-side-effects`);
      if (define) {
        for (let key in define) {
          if (key.indexOf("=") >= 0) throw new Error(`Invalid define: ${key}`);
          flags.push(`--define:${key}=${validateStringValue(define[key], "define", key)}`);
        }
      }
      if (logOverride) {
        for (let key in logOverride) {
          if (key.indexOf("=") >= 0) throw new Error(`Invalid log override: ${key}`);
          flags.push(`--log-override:${key}=${validateStringValue(logOverride[key], "log override", key)}`);
        }
      }
      if (supported) {
        for (let key in supported) {
          if (key.indexOf("=") >= 0) throw new Error(`Invalid supported: ${key}`);
          const value = supported[key];
          if (typeof value !== "boolean") throw new Error(`Expected value for supported ${quote(key)} to be a boolean, got ${typeof value} instead`);
          flags.push(`--supported:${key}=${value}`);
        }
      }
      if (pure) for (let fn of pure) flags.push(`--pure:${validateStringValue(fn, "pure")}`);
      if (keepNames) flags.push(`--keep-names`);
    }
    function flagsForBuildOptions(callName, options, isTTY2, logLevelDefault, writeDefault) {
      var _a2;
      let flags = [];
      let entries = [];
      let keys = /* @__PURE__ */ Object.create(null);
      let stdinContents = null;
      let stdinResolveDir = null;
      pushLogFlags(flags, options, keys, isTTY2, logLevelDefault);
      pushCommonFlags(flags, options, keys);
      let sourcemap = getFlag(options, keys, "sourcemap", mustBeStringOrBoolean);
      let bundle = getFlag(options, keys, "bundle", mustBeBoolean);
      let splitting = getFlag(options, keys, "splitting", mustBeBoolean);
      let preserveSymlinks = getFlag(options, keys, "preserveSymlinks", mustBeBoolean);
      let metafile = getFlag(options, keys, "metafile", mustBeBoolean);
      let outfile = getFlag(options, keys, "outfile", mustBeString);
      let outdir = getFlag(options, keys, "outdir", mustBeString);
      let outbase = getFlag(options, keys, "outbase", mustBeString);
      let tsconfig = getFlag(options, keys, "tsconfig", mustBeString);
      let resolveExtensions = getFlag(options, keys, "resolveExtensions", mustBeArrayOfStrings);
      let nodePathsInput = getFlag(options, keys, "nodePaths", mustBeArrayOfStrings);
      let mainFields = getFlag(options, keys, "mainFields", mustBeArrayOfStrings);
      let conditions = getFlag(options, keys, "conditions", mustBeArrayOfStrings);
      let external = getFlag(options, keys, "external", mustBeArrayOfStrings);
      let packages = getFlag(options, keys, "packages", mustBeString);
      let alias = getFlag(options, keys, "alias", mustBeObject);
      let loader = getFlag(options, keys, "loader", mustBeObject);
      let outExtension = getFlag(options, keys, "outExtension", mustBeObject);
      let publicPath = getFlag(options, keys, "publicPath", mustBeString);
      let entryNames = getFlag(options, keys, "entryNames", mustBeString);
      let chunkNames = getFlag(options, keys, "chunkNames", mustBeString);
      let assetNames = getFlag(options, keys, "assetNames", mustBeString);
      let inject = getFlag(options, keys, "inject", mustBeArrayOfStrings);
      let banner = getFlag(options, keys, "banner", mustBeObject);
      let footer = getFlag(options, keys, "footer", mustBeObject);
      let entryPoints = getFlag(options, keys, "entryPoints", mustBeEntryPoints);
      let absWorkingDir = getFlag(options, keys, "absWorkingDir", mustBeString);
      let stdin = getFlag(options, keys, "stdin", mustBeObject);
      let write = (_a2 = getFlag(options, keys, "write", mustBeBoolean)) != null ? _a2 : writeDefault;
      let allowOverwrite = getFlag(options, keys, "allowOverwrite", mustBeBoolean);
      let mangleCache = getFlag(options, keys, "mangleCache", mustBeObject);
      keys.plugins = true;
      checkForInvalidFlags(options, keys, `in ${callName}() call`);
      if (sourcemap) flags.push(`--sourcemap${sourcemap === true ? "" : `=${sourcemap}`}`);
      if (bundle) flags.push("--bundle");
      if (allowOverwrite) flags.push("--allow-overwrite");
      if (splitting) flags.push("--splitting");
      if (preserveSymlinks) flags.push("--preserve-symlinks");
      if (metafile) flags.push(`--metafile`);
      if (outfile) flags.push(`--outfile=${outfile}`);
      if (outdir) flags.push(`--outdir=${outdir}`);
      if (outbase) flags.push(`--outbase=${outbase}`);
      if (tsconfig) flags.push(`--tsconfig=${tsconfig}`);
      if (packages) flags.push(`--packages=${packages}`);
      if (resolveExtensions) flags.push(`--resolve-extensions=${validateAndJoinStringArray(resolveExtensions, "resolve extension")}`);
      if (publicPath) flags.push(`--public-path=${publicPath}`);
      if (entryNames) flags.push(`--entry-names=${entryNames}`);
      if (chunkNames) flags.push(`--chunk-names=${chunkNames}`);
      if (assetNames) flags.push(`--asset-names=${assetNames}`);
      if (mainFields) flags.push(`--main-fields=${validateAndJoinStringArray(mainFields, "main field")}`);
      if (conditions) flags.push(`--conditions=${validateAndJoinStringArray(conditions, "condition")}`);
      if (external) for (let name of external) flags.push(`--external:${validateStringValue(name, "external")}`);
      if (alias) {
        for (let old in alias) {
          if (old.indexOf("=") >= 0) throw new Error(`Invalid package name in alias: ${old}`);
          flags.push(`--alias:${old}=${validateStringValue(alias[old], "alias", old)}`);
        }
      }
      if (banner) {
        for (let type in banner) {
          if (type.indexOf("=") >= 0) throw new Error(`Invalid banner file type: ${type}`);
          flags.push(`--banner:${type}=${validateStringValue(banner[type], "banner", type)}`);
        }
      }
      if (footer) {
        for (let type in footer) {
          if (type.indexOf("=") >= 0) throw new Error(`Invalid footer file type: ${type}`);
          flags.push(`--footer:${type}=${validateStringValue(footer[type], "footer", type)}`);
        }
      }
      if (inject) for (let path3 of inject) flags.push(`--inject:${validateStringValue(path3, "inject")}`);
      if (loader) {
        for (let ext in loader) {
          if (ext.indexOf("=") >= 0) throw new Error(`Invalid loader extension: ${ext}`);
          flags.push(`--loader:${ext}=${validateStringValue(loader[ext], "loader", ext)}`);
        }
      }
      if (outExtension) {
        for (let ext in outExtension) {
          if (ext.indexOf("=") >= 0) throw new Error(`Invalid out extension: ${ext}`);
          flags.push(`--out-extension:${ext}=${validateStringValue(outExtension[ext], "out extension", ext)}`);
        }
      }
      if (entryPoints) {
        if (Array.isArray(entryPoints)) {
          for (let i = 0, n = entryPoints.length; i < n; i++) {
            let entryPoint = entryPoints[i];
            if (typeof entryPoint === "object" && entryPoint !== null) {
              let entryPointKeys = /* @__PURE__ */ Object.create(null);
              let input = getFlag(entryPoint, entryPointKeys, "in", mustBeString);
              let output = getFlag(entryPoint, entryPointKeys, "out", mustBeString);
              checkForInvalidFlags(entryPoint, entryPointKeys, "in entry point at index " + i);
              if (input === void 0) throw new Error('Missing property "in" for entry point at index ' + i);
              if (output === void 0) throw new Error('Missing property "out" for entry point at index ' + i);
              entries.push([output, input]);
            } else {
              entries.push(["", validateStringValue(entryPoint, "entry point at index " + i)]);
            }
          }
        } else {
          for (let key in entryPoints) {
            entries.push([key, validateStringValue(entryPoints[key], "entry point", key)]);
          }
        }
      }
      if (stdin) {
        let stdinKeys = /* @__PURE__ */ Object.create(null);
        let contents = getFlag(stdin, stdinKeys, "contents", mustBeStringOrUint8Array);
        let resolveDir = getFlag(stdin, stdinKeys, "resolveDir", mustBeString);
        let sourcefile = getFlag(stdin, stdinKeys, "sourcefile", mustBeString);
        let loader2 = getFlag(stdin, stdinKeys, "loader", mustBeString);
        checkForInvalidFlags(stdin, stdinKeys, 'in "stdin" object');
        if (sourcefile) flags.push(`--sourcefile=${sourcefile}`);
        if (loader2) flags.push(`--loader=${loader2}`);
        if (resolveDir) stdinResolveDir = resolveDir;
        if (typeof contents === "string") stdinContents = encodeUTF8(contents);
        else if (contents instanceof Uint8Array) stdinContents = contents;
      }
      let nodePaths = [];
      if (nodePathsInput) {
        for (let value of nodePathsInput) {
          value += "";
          nodePaths.push(value);
        }
      }
      return {
        entries,
        flags,
        write,
        stdinContents,
        stdinResolveDir,
        absWorkingDir,
        nodePaths,
        mangleCache: validateMangleCache(mangleCache)
      };
    }
    function flagsForTransformOptions(callName, options, isTTY2, logLevelDefault) {
      let flags = [];
      let keys = /* @__PURE__ */ Object.create(null);
      pushLogFlags(flags, options, keys, isTTY2, logLevelDefault);
      pushCommonFlags(flags, options, keys);
      let sourcemap = getFlag(options, keys, "sourcemap", mustBeStringOrBoolean);
      let sourcefile = getFlag(options, keys, "sourcefile", mustBeString);
      let loader = getFlag(options, keys, "loader", mustBeString);
      let banner = getFlag(options, keys, "banner", mustBeString);
      let footer = getFlag(options, keys, "footer", mustBeString);
      let mangleCache = getFlag(options, keys, "mangleCache", mustBeObject);
      checkForInvalidFlags(options, keys, `in ${callName}() call`);
      if (sourcemap) flags.push(`--sourcemap=${sourcemap === true ? "external" : sourcemap}`);
      if (sourcefile) flags.push(`--sourcefile=${sourcefile}`);
      if (loader) flags.push(`--loader=${loader}`);
      if (banner) flags.push(`--banner=${banner}`);
      if (footer) flags.push(`--footer=${footer}`);
      return {
        flags,
        mangleCache: validateMangleCache(mangleCache)
      };
    }
    function createChannel(streamIn) {
      const requestCallbacksByKey = {};
      const closeData = { didClose: false, reason: "" };
      let responseCallbacks = {};
      let nextRequestID = 0;
      let nextBuildKey = 0;
      let stdout = new Uint8Array(16 * 1024);
      let stdoutUsed = 0;
      let readFromStdout = (chunk) => {
        let limit = stdoutUsed + chunk.length;
        if (limit > stdout.length) {
          let swap = new Uint8Array(limit * 2);
          swap.set(stdout);
          stdout = swap;
        }
        stdout.set(chunk, stdoutUsed);
        stdoutUsed += chunk.length;
        let offset = 0;
        while (offset + 4 <= stdoutUsed) {
          let length = readUInt32LE(stdout, offset);
          if (offset + 4 + length > stdoutUsed) {
            break;
          }
          offset += 4;
          handleIncomingPacket(stdout.subarray(offset, offset + length));
          offset += length;
        }
        if (offset > 0) {
          stdout.copyWithin(0, offset, stdoutUsed);
          stdoutUsed -= offset;
        }
      };
      let afterClose = (error) => {
        closeData.didClose = true;
        if (error) closeData.reason = ": " + (error.message || error);
        const text = "The service was stopped" + closeData.reason;
        for (let id in responseCallbacks) {
          responseCallbacks[id](text, null);
        }
        responseCallbacks = {};
      };
      let sendRequest = (refs, value, callback) => {
        if (closeData.didClose) return callback("The service is no longer running" + closeData.reason, null);
        let id = nextRequestID++;
        responseCallbacks[id] = (error, response) => {
          try {
            callback(error, response);
          } finally {
            if (refs) refs.unref();
          }
        };
        if (refs) refs.ref();
        streamIn.writeToStdin(encodePacket({ id, isRequest: true, value }));
      };
      let sendResponse = (id, value) => {
        if (closeData.didClose) throw new Error("The service is no longer running" + closeData.reason);
        streamIn.writeToStdin(encodePacket({ id, isRequest: false, value }));
      };
      let handleRequest = async (id, request) => {
        try {
          if (request.command === "ping") {
            sendResponse(id, {});
            return;
          }
          if (typeof request.key === "number") {
            const requestCallbacks = requestCallbacksByKey[request.key];
            if (!requestCallbacks) {
              return;
            }
            const callback = requestCallbacks[request.command];
            if (callback) {
              await callback(id, request);
              return;
            }
          }
          throw new Error(`Invalid command: ` + request.command);
        } catch (e) {
          const errors = [extractErrorMessageV8(e, streamIn, null, void 0, "")];
          try {
            sendResponse(id, { errors });
          } catch {
          }
        }
      };
      let isFirstPacket = true;
      let handleIncomingPacket = (bytes) => {
        if (isFirstPacket) {
          isFirstPacket = false;
          let binaryVersion = String.fromCharCode(...bytes);
          if (binaryVersion !== "0.28.1") {
            throw new Error(`Cannot start service: Host version "${"0.28.1"}" does not match binary version ${quote(binaryVersion)}`);
          }
          return;
        }
        let packet = decodePacket(bytes);
        if (packet.isRequest) {
          handleRequest(packet.id, packet.value);
        } else {
          let callback = responseCallbacks[packet.id];
          delete responseCallbacks[packet.id];
          if (packet.value.error) callback(packet.value.error, {});
          else callback(null, packet.value);
        }
      };
      let buildOrContext = ({ callName, refs, options, isTTY: isTTY2, defaultWD: defaultWD2, callback }) => {
        let refCount = 0;
        const buildKey = nextBuildKey++;
        const requestCallbacks = {};
        const buildRefs = {
          ref() {
            if (++refCount === 1) {
              if (refs) refs.ref();
            }
          },
          unref() {
            if (--refCount === 0) {
              delete requestCallbacksByKey[buildKey];
              if (refs) refs.unref();
            }
          }
        };
        requestCallbacksByKey[buildKey] = requestCallbacks;
        buildRefs.ref();
        buildOrContextImpl(
          callName,
          buildKey,
          sendRequest,
          sendResponse,
          buildRefs,
          streamIn,
          requestCallbacks,
          options,
          isTTY2,
          defaultWD2,
          (err, res) => {
            try {
              callback(err, res);
            } finally {
              buildRefs.unref();
            }
          }
        );
      };
      let transform2 = ({ callName, refs, input, options, isTTY: isTTY2, fs: fs3, callback }) => {
        const details = createObjectStash();
        let start = (inputPath) => {
          try {
            if (typeof input !== "string" && !(input instanceof Uint8Array))
              throw new Error('The input to "transform" must be a string or a Uint8Array');
            let {
              flags,
              mangleCache
            } = flagsForTransformOptions(callName, options, isTTY2, transformLogLevelDefault);
            let request = {
              command: "transform",
              flags,
              inputFS: inputPath !== null,
              input: inputPath !== null ? encodeUTF8(inputPath) : typeof input === "string" ? encodeUTF8(input) : input
            };
            if (mangleCache) request.mangleCache = mangleCache;
            sendRequest(refs, request, (error, response) => {
              if (error) return callback(new Error(error), null);
              let errors = replaceDetailsInMessages(response.errors, details);
              let warnings = replaceDetailsInMessages(response.warnings, details);
              let outstanding = 1;
              let next = () => {
                if (--outstanding === 0) {
                  let result = {
                    warnings,
                    code: response.code,
                    map: response.map,
                    mangleCache: void 0,
                    legalComments: void 0
                  };
                  if ("legalComments" in response) result.legalComments = response == null ? void 0 : response.legalComments;
                  if (response.mangleCache) result.mangleCache = response == null ? void 0 : response.mangleCache;
                  callback(null, result);
                }
              };
              if (errors.length > 0) return callback(failureErrorWithLog("Transform failed", errors, warnings), null);
              if (response.codeFS) {
                outstanding++;
                fs3.readFile(response.code, (err, contents) => {
                  if (err !== null) {
                    callback(err, null);
                  } else {
                    response.code = contents;
                    next();
                  }
                });
              }
              if (response.mapFS) {
                outstanding++;
                fs3.readFile(response.map, (err, contents) => {
                  if (err !== null) {
                    callback(err, null);
                  } else {
                    response.map = contents;
                    next();
                  }
                });
              }
              next();
            });
          } catch (e) {
            let flags = [];
            try {
              pushLogFlags(flags, options, {}, isTTY2, transformLogLevelDefault);
            } catch {
            }
            const error = extractErrorMessageV8(e, streamIn, details, void 0, "");
            sendRequest(refs, { command: "error", flags, error }, () => {
              error.detail = details.load(error.detail);
              callback(failureErrorWithLog("Transform failed", [error], []), null);
            });
          }
        };
        if ((typeof input === "string" || input instanceof Uint8Array) && input.length > 1024 * 1024) {
          let next = start;
          start = () => fs3.writeFile(input, next);
        }
        start(null);
      };
      let formatMessages2 = ({ callName, refs, messages, options, callback }) => {
        if (!options) throw new Error(`Missing second argument in ${callName}() call`);
        let keys = {};
        let kind = getFlag(options, keys, "kind", mustBeString);
        let color = getFlag(options, keys, "color", mustBeBoolean);
        let terminalWidth = getFlag(options, keys, "terminalWidth", mustBeInteger);
        checkForInvalidFlags(options, keys, `in ${callName}() call`);
        if (kind === void 0) throw new Error(`Missing "kind" in ${callName}() call`);
        if (kind !== "error" && kind !== "warning") throw new Error(`Expected "kind" to be "error" or "warning" in ${callName}() call`);
        let request = {
          command: "format-msgs",
          messages: sanitizeMessages(messages, "messages", null, "", terminalWidth),
          isWarning: kind === "warning"
        };
        if (color !== void 0) request.color = color;
        if (terminalWidth !== void 0) request.terminalWidth = terminalWidth;
        sendRequest(refs, request, (error, response) => {
          if (error) return callback(new Error(error), null);
          callback(null, response.messages);
        });
      };
      let analyzeMetafile2 = ({ callName, refs, metafile, options, callback }) => {
        if (options === void 0) options = {};
        let keys = {};
        let color = getFlag(options, keys, "color", mustBeBoolean);
        let verbose = getFlag(options, keys, "verbose", mustBeBoolean);
        checkForInvalidFlags(options, keys, `in ${callName}() call`);
        let request = {
          command: "analyze-metafile",
          metafile
        };
        if (color !== void 0) request.color = color;
        if (verbose !== void 0) request.verbose = verbose;
        sendRequest(refs, request, (error, response) => {
          if (error) return callback(new Error(error), null);
          callback(null, response.result);
        });
      };
      return {
        readFromStdout,
        afterClose,
        service: {
          buildOrContext,
          transform: transform2,
          formatMessages: formatMessages2,
          analyzeMetafile: analyzeMetafile2
        }
      };
    }
    function buildOrContextImpl(callName, buildKey, sendRequest, sendResponse, refs, streamIn, requestCallbacks, options, isTTY2, defaultWD2, callback) {
      const details = createObjectStash();
      const isContext = callName === "context";
      const handleError = (e, pluginName) => {
        const flags = [];
        try {
          pushLogFlags(flags, options, {}, isTTY2, buildLogLevelDefault);
        } catch {
        }
        const message = extractErrorMessageV8(e, streamIn, details, void 0, pluginName);
        sendRequest(refs, { command: "error", flags, error: message }, () => {
          message.detail = details.load(message.detail);
          callback(failureErrorWithLog(isContext ? "Context failed" : "Build failed", [message], []), null);
        });
      };
      let plugins;
      if (typeof options === "object") {
        const value = options.plugins;
        if (value !== void 0) {
          if (!Array.isArray(value)) return handleError(new Error(`"plugins" must be an array`), "");
          plugins = value;
        }
      }
      if (plugins && plugins.length > 0) {
        if (streamIn.isSync) return handleError(new Error("Cannot use plugins in synchronous API calls"), "");
        handlePlugins(
          buildKey,
          sendRequest,
          sendResponse,
          refs,
          streamIn,
          requestCallbacks,
          options,
          plugins,
          details
        ).then(
          (result) => {
            if (!result.ok) return handleError(result.error, result.pluginName);
            try {
              buildOrContextContinue(result.requestPlugins, result.runOnEndCallbacks, result.scheduleOnDisposeCallbacks);
            } catch (e) {
              handleError(e, "");
            }
          },
          (e) => handleError(e, "")
        );
        return;
      }
      try {
        buildOrContextContinue(null, (result, done) => done([], []), () => {
        });
      } catch (e) {
        handleError(e, "");
      }
      function buildOrContextContinue(requestPlugins, runOnEndCallbacks, scheduleOnDisposeCallbacks) {
        const writeDefault = streamIn.hasFS;
        const {
          entries,
          flags,
          write,
          stdinContents,
          stdinResolveDir,
          absWorkingDir,
          nodePaths,
          mangleCache
        } = flagsForBuildOptions(callName, options, isTTY2, buildLogLevelDefault, writeDefault);
        if (write && !streamIn.hasFS) throw new Error(`The "write" option is unavailable in this environment`);
        const request = {
          command: "build",
          key: buildKey,
          entries,
          flags,
          write,
          stdinContents,
          stdinResolveDir,
          absWorkingDir: absWorkingDir || defaultWD2,
          nodePaths,
          context: isContext
        };
        if (requestPlugins) request.plugins = requestPlugins;
        if (mangleCache) request.mangleCache = mangleCache;
        const buildResponseToResult = (response, callback2) => {
          const result = {
            errors: replaceDetailsInMessages(response.errors, details),
            warnings: replaceDetailsInMessages(response.warnings, details),
            outputFiles: void 0,
            metafile: void 0,
            mangleCache: void 0
          };
          const originalErrors = result.errors.slice();
          const originalWarnings = result.warnings.slice();
          if (response.outputFiles) result.outputFiles = response.outputFiles.map(convertOutputFiles);
          if (response.metafile && response.metafile.length) result.metafile = parseJSON(response.metafile);
          if (response.mangleCache) result.mangleCache = response.mangleCache;
          if (response.writeToStdout !== void 0) console.log(decodeUTF8(response.writeToStdout).replace(/\n$/, ""));
          runOnEndCallbacks(result, (onEndErrors, onEndWarnings) => {
            if (originalErrors.length > 0 || onEndErrors.length > 0) {
              const error = failureErrorWithLog("Build failed", originalErrors.concat(onEndErrors), originalWarnings.concat(onEndWarnings));
              return callback2(error, null, onEndErrors, onEndWarnings);
            }
            callback2(null, result, onEndErrors, onEndWarnings);
          });
        };
        let latestResultPromise;
        let provideLatestResult;
        if (isContext)
          requestCallbacks["on-end"] = (id, request2) => new Promise((resolve7) => {
            buildResponseToResult(request2, (err, result, onEndErrors, onEndWarnings) => {
              const response = {
                errors: onEndErrors,
                warnings: onEndWarnings
              };
              if (provideLatestResult) provideLatestResult(err, result);
              latestResultPromise = void 0;
              provideLatestResult = void 0;
              sendResponse(id, response);
              resolve7();
            });
          });
        sendRequest(refs, request, (error, response) => {
          if (error) return callback(new Error(error), null);
          if (!isContext) {
            return buildResponseToResult(response, (err, res) => {
              scheduleOnDisposeCallbacks();
              return callback(err, res);
            });
          }
          if (response.errors.length > 0) {
            return callback(failureErrorWithLog("Context failed", response.errors, response.warnings), null);
          }
          let didDispose = false;
          const result = {
            rebuild: () => {
              if (!latestResultPromise) latestResultPromise = new Promise((resolve7, reject) => {
                let settlePromise;
                provideLatestResult = (err, result2) => {
                  if (!settlePromise) settlePromise = () => err ? reject(err) : resolve7(result2);
                };
                const triggerAnotherBuild = () => {
                  const request2 = {
                    command: "rebuild",
                    key: buildKey
                  };
                  sendRequest(refs, request2, (error2, response2) => {
                    if (error2) {
                      reject(new Error(error2));
                    } else if (settlePromise) {
                      settlePromise();
                    } else {
                      triggerAnotherBuild();
                    }
                  });
                };
                triggerAnotherBuild();
              });
              return latestResultPromise;
            },
            watch: (options2 = {}) => new Promise((resolve7, reject) => {
              if (!streamIn.hasFS) throw new Error(`Cannot use the "watch" API in this environment`);
              const keys = {};
              const delay = getFlag(options2, keys, "delay", mustBeInteger);
              checkForInvalidFlags(options2, keys, `in watch() call`);
              const request2 = {
                command: "watch",
                key: buildKey
              };
              if (delay) request2.delay = delay;
              sendRequest(refs, request2, (error2) => {
                if (error2) reject(new Error(error2));
                else resolve7(void 0);
              });
            }),
            serve: (options2 = {}) => new Promise((resolve7, reject) => {
              if (!streamIn.hasFS) throw new Error(`Cannot use the "serve" API in this environment`);
              const keys = {};
              const port = getFlag(options2, keys, "port", mustBeValidPortNumber);
              const host = getFlag(options2, keys, "host", mustBeString);
              const servedir = getFlag(options2, keys, "servedir", mustBeString);
              const keyfile = getFlag(options2, keys, "keyfile", mustBeString);
              const certfile = getFlag(options2, keys, "certfile", mustBeString);
              const fallback = getFlag(options2, keys, "fallback", mustBeString);
              const cors = getFlag(options2, keys, "cors", mustBeObject);
              const onRequest = getFlag(options2, keys, "onRequest", mustBeFunction);
              checkForInvalidFlags(options2, keys, `in serve() call`);
              const request2 = {
                command: "serve",
                key: buildKey,
                onRequest: !!onRequest
              };
              if (port !== void 0) request2.port = port;
              if (host !== void 0) request2.host = host;
              if (servedir !== void 0) request2.servedir = servedir;
              if (keyfile !== void 0) request2.keyfile = keyfile;
              if (certfile !== void 0) request2.certfile = certfile;
              if (fallback !== void 0) request2.fallback = fallback;
              if (cors) {
                const corsKeys = {};
                const origin = getFlag(cors, corsKeys, "origin", mustBeStringOrArrayOfStrings);
                checkForInvalidFlags(cors, corsKeys, `on "cors" object`);
                if (Array.isArray(origin)) request2.corsOrigin = origin;
                else if (origin !== void 0) request2.corsOrigin = [origin];
              }
              sendRequest(refs, request2, (error2, response2) => {
                if (error2) return reject(new Error(error2));
                if (onRequest) {
                  requestCallbacks["serve-request"] = (id, request3) => {
                    onRequest(request3.args);
                    sendResponse(id, {});
                  };
                }
                resolve7(response2);
              });
            }),
            cancel: () => new Promise((resolve7) => {
              if (didDispose) return resolve7();
              const request2 = {
                command: "cancel",
                key: buildKey
              };
              sendRequest(refs, request2, () => {
                resolve7();
              });
            }),
            dispose: () => new Promise((resolve7) => {
              if (didDispose) return resolve7();
              didDispose = true;
              const request2 = {
                command: "dispose",
                key: buildKey
              };
              sendRequest(refs, request2, () => {
                resolve7();
                scheduleOnDisposeCallbacks();
                refs.unref();
              });
            })
          };
          refs.ref();
          callback(null, result);
        });
      }
    }
    var handlePlugins = async (buildKey, sendRequest, sendResponse, refs, streamIn, requestCallbacks, initialOptions, plugins, details) => {
      let onStartCallbacks = [];
      let onEndCallbacks = [];
      let onResolveCallbacks = {};
      let onLoadCallbacks = {};
      let onDisposeCallbacks = [];
      let nextCallbackID = 0;
      let i = 0;
      let requestPlugins = [];
      let isSetupDone = false;
      plugins = [...plugins];
      for (let item of plugins) {
        let keys = {};
        if (typeof item !== "object") throw new Error(`Plugin at index ${i} must be an object`);
        const name = getFlag(item, keys, "name", mustBeString);
        if (typeof name !== "string" || name === "") throw new Error(`Plugin at index ${i} is missing a name`);
        try {
          let setup = getFlag(item, keys, "setup", mustBeFunction);
          if (typeof setup !== "function") throw new Error(`Plugin is missing a setup function`);
          checkForInvalidFlags(item, keys, `on plugin ${quote(name)}`);
          let plugin = {
            name,
            onStart: false,
            onEnd: false,
            onResolve: [],
            onLoad: []
          };
          i++;
          let resolve7 = (path3, options = {}) => {
            if (!isSetupDone) throw new Error('Cannot call "resolve" before plugin setup has completed');
            if (typeof path3 !== "string") throw new Error(`The path to resolve must be a string`);
            let keys2 = /* @__PURE__ */ Object.create(null);
            let pluginName = getFlag(options, keys2, "pluginName", mustBeString);
            let importer = getFlag(options, keys2, "importer", mustBeString);
            let namespace = getFlag(options, keys2, "namespace", mustBeString);
            let resolveDir = getFlag(options, keys2, "resolveDir", mustBeString);
            let kind = getFlag(options, keys2, "kind", mustBeString);
            let pluginData = getFlag(options, keys2, "pluginData", canBeAnything);
            let importAttributes = getFlag(options, keys2, "with", mustBeObject);
            checkForInvalidFlags(options, keys2, "in resolve() call");
            return new Promise((resolve22, reject) => {
              const request = {
                command: "resolve",
                path: path3,
                key: buildKey,
                pluginName: name
              };
              if (pluginName != null) request.pluginName = pluginName;
              if (importer != null) request.importer = importer;
              if (namespace != null) request.namespace = namespace;
              if (resolveDir != null) request.resolveDir = resolveDir;
              if (kind != null) request.kind = kind;
              else throw new Error(`Must specify "kind" when calling "resolve"`);
              if (pluginData != null) request.pluginData = details.store(pluginData);
              if (importAttributes != null) request.with = sanitizeStringMap(importAttributes, "with");
              sendRequest(refs, request, (error, response) => {
                if (error !== null) reject(new Error(error));
                else resolve22({
                  errors: replaceDetailsInMessages(response.errors, details),
                  warnings: replaceDetailsInMessages(response.warnings, details),
                  path: response.path,
                  external: response.external,
                  sideEffects: response.sideEffects,
                  namespace: response.namespace,
                  suffix: response.suffix,
                  pluginData: details.load(response.pluginData)
                });
              });
            });
          };
          let promise = setup({
            initialOptions,
            resolve: resolve7,
            onStart(callback) {
              let registeredText = `This error came from the "onStart" callback registered here:`;
              let registeredNote = extractCallerV8(new Error(registeredText), streamIn, "onStart");
              onStartCallbacks.push({ name, callback, note: registeredNote });
              plugin.onStart = true;
            },
            onEnd(callback) {
              let registeredText = `This error came from the "onEnd" callback registered here:`;
              let registeredNote = extractCallerV8(new Error(registeredText), streamIn, "onEnd");
              onEndCallbacks.push({ name, callback, note: registeredNote });
              plugin.onEnd = true;
            },
            onResolve(options, callback) {
              let registeredText = `This error came from the "onResolve" callback registered here:`;
              let registeredNote = extractCallerV8(new Error(registeredText), streamIn, "onResolve");
              let keys2 = {};
              let filter = getFlag(options, keys2, "filter", mustBeRegExp);
              let namespace = getFlag(options, keys2, "namespace", mustBeString);
              checkForInvalidFlags(options, keys2, `in onResolve() call for plugin ${quote(name)}`);
              if (filter == null) throw new Error(`onResolve() call is missing a filter`);
              let id = nextCallbackID++;
              onResolveCallbacks[id] = { name, callback, note: registeredNote };
              plugin.onResolve.push({ id, filter: jsRegExpToGoRegExp(filter), namespace: namespace || "" });
            },
            onLoad(options, callback) {
              let registeredText = `This error came from the "onLoad" callback registered here:`;
              let registeredNote = extractCallerV8(new Error(registeredText), streamIn, "onLoad");
              let keys2 = {};
              let filter = getFlag(options, keys2, "filter", mustBeRegExp);
              let namespace = getFlag(options, keys2, "namespace", mustBeString);
              checkForInvalidFlags(options, keys2, `in onLoad() call for plugin ${quote(name)}`);
              if (filter == null) throw new Error(`onLoad() call is missing a filter`);
              let id = nextCallbackID++;
              onLoadCallbacks[id] = { name, callback, note: registeredNote };
              plugin.onLoad.push({ id, filter: jsRegExpToGoRegExp(filter), namespace: namespace || "" });
            },
            onDispose(callback) {
              onDisposeCallbacks.push(callback);
            },
            esbuild: streamIn.esbuild
          });
          if (promise) await promise;
          requestPlugins.push(plugin);
        } catch (e) {
          return { ok: false, error: e, pluginName: name };
        }
      }
      requestCallbacks["on-start"] = async (id, request) => {
        details.clear();
        let response = { errors: [], warnings: [] };
        await Promise.all(onStartCallbacks.map(async ({ name, callback, note }) => {
          try {
            let result = await callback();
            if (result != null) {
              if (typeof result !== "object") throw new Error(`Expected onStart() callback in plugin ${quote(name)} to return an object`);
              let keys = {};
              let errors = getFlag(result, keys, "errors", mustBeArray);
              let warnings = getFlag(result, keys, "warnings", mustBeArray);
              checkForInvalidFlags(result, keys, `from onStart() callback in plugin ${quote(name)}`);
              if (errors != null) response.errors.push(...sanitizeMessages(errors, "errors", details, name, void 0));
              if (warnings != null) response.warnings.push(...sanitizeMessages(warnings, "warnings", details, name, void 0));
            }
          } catch (e) {
            response.errors.push(extractErrorMessageV8(e, streamIn, details, note && note(), name));
          }
        }));
        sendResponse(id, response);
      };
      requestCallbacks["on-resolve"] = async (id, request) => {
        let response = {}, name = "", callback, note;
        for (let id2 of request.ids) {
          try {
            ({ name, callback, note } = onResolveCallbacks[id2]);
            let result = await callback({
              path: request.path,
              importer: request.importer,
              namespace: request.namespace,
              resolveDir: request.resolveDir,
              kind: request.kind,
              pluginData: details.load(request.pluginData),
              with: request.with
            });
            if (result != null) {
              if (typeof result !== "object") throw new Error(`Expected onResolve() callback in plugin ${quote(name)} to return an object`);
              let keys = {};
              let pluginName = getFlag(result, keys, "pluginName", mustBeString);
              let path3 = getFlag(result, keys, "path", mustBeString);
              let namespace = getFlag(result, keys, "namespace", mustBeString);
              let suffix = getFlag(result, keys, "suffix", mustBeString);
              let external = getFlag(result, keys, "external", mustBeBoolean);
              let sideEffects = getFlag(result, keys, "sideEffects", mustBeBoolean);
              let pluginData = getFlag(result, keys, "pluginData", canBeAnything);
              let errors = getFlag(result, keys, "errors", mustBeArray);
              let warnings = getFlag(result, keys, "warnings", mustBeArray);
              let watchFiles = getFlag(result, keys, "watchFiles", mustBeArrayOfStrings);
              let watchDirs = getFlag(result, keys, "watchDirs", mustBeArrayOfStrings);
              checkForInvalidFlags(result, keys, `from onResolve() callback in plugin ${quote(name)}`);
              response.id = id2;
              if (pluginName != null) response.pluginName = pluginName;
              if (path3 != null) response.path = path3;
              if (namespace != null) response.namespace = namespace;
              if (suffix != null) response.suffix = suffix;
              if (external != null) response.external = external;
              if (sideEffects != null) response.sideEffects = sideEffects;
              if (pluginData != null) response.pluginData = details.store(pluginData);
              if (errors != null) response.errors = sanitizeMessages(errors, "errors", details, name, void 0);
              if (warnings != null) response.warnings = sanitizeMessages(warnings, "warnings", details, name, void 0);
              if (watchFiles != null) response.watchFiles = sanitizeStringArray(watchFiles, "watchFiles");
              if (watchDirs != null) response.watchDirs = sanitizeStringArray(watchDirs, "watchDirs");
              break;
            }
          } catch (e) {
            response = { id: id2, errors: [extractErrorMessageV8(e, streamIn, details, note && note(), name)] };
            break;
          }
        }
        sendResponse(id, response);
      };
      requestCallbacks["on-load"] = async (id, request) => {
        let response = {}, name = "", callback, note;
        for (let id2 of request.ids) {
          try {
            ({ name, callback, note } = onLoadCallbacks[id2]);
            let result = await callback({
              path: request.path,
              namespace: request.namespace,
              suffix: request.suffix,
              pluginData: details.load(request.pluginData),
              with: request.with
            });
            if (result != null) {
              if (typeof result !== "object") throw new Error(`Expected onLoad() callback in plugin ${quote(name)} to return an object`);
              let keys = {};
              let pluginName = getFlag(result, keys, "pluginName", mustBeString);
              let contents = getFlag(result, keys, "contents", mustBeStringOrUint8Array);
              let resolveDir = getFlag(result, keys, "resolveDir", mustBeString);
              let pluginData = getFlag(result, keys, "pluginData", canBeAnything);
              let loader = getFlag(result, keys, "loader", mustBeString);
              let errors = getFlag(result, keys, "errors", mustBeArray);
              let warnings = getFlag(result, keys, "warnings", mustBeArray);
              let watchFiles = getFlag(result, keys, "watchFiles", mustBeArrayOfStrings);
              let watchDirs = getFlag(result, keys, "watchDirs", mustBeArrayOfStrings);
              checkForInvalidFlags(result, keys, `from onLoad() callback in plugin ${quote(name)}`);
              response.id = id2;
              if (pluginName != null) response.pluginName = pluginName;
              if (contents instanceof Uint8Array) response.contents = contents;
              else if (contents != null) response.contents = encodeUTF8(contents);
              if (resolveDir != null) response.resolveDir = resolveDir;
              if (pluginData != null) response.pluginData = details.store(pluginData);
              if (loader != null) response.loader = loader;
              if (errors != null) response.errors = sanitizeMessages(errors, "errors", details, name, void 0);
              if (warnings != null) response.warnings = sanitizeMessages(warnings, "warnings", details, name, void 0);
              if (watchFiles != null) response.watchFiles = sanitizeStringArray(watchFiles, "watchFiles");
              if (watchDirs != null) response.watchDirs = sanitizeStringArray(watchDirs, "watchDirs");
              break;
            }
          } catch (e) {
            response = { id: id2, errors: [extractErrorMessageV8(e, streamIn, details, note && note(), name)] };
            break;
          }
        }
        sendResponse(id, response);
      };
      let runOnEndCallbacks = (result, done) => done([], []);
      if (onEndCallbacks.length > 0) {
        runOnEndCallbacks = (result, done) => {
          (async () => {
            const onEndErrors = [];
            const onEndWarnings = [];
            for (const { name, callback, note } of onEndCallbacks) {
              let newErrors;
              let newWarnings;
              try {
                const value = await callback(result);
                if (value != null) {
                  if (typeof value !== "object") throw new Error(`Expected onEnd() callback in plugin ${quote(name)} to return an object`);
                  let keys = {};
                  let errors = getFlag(value, keys, "errors", mustBeArray);
                  let warnings = getFlag(value, keys, "warnings", mustBeArray);
                  checkForInvalidFlags(value, keys, `from onEnd() callback in plugin ${quote(name)}`);
                  if (errors != null) newErrors = sanitizeMessages(errors, "errors", details, name, void 0);
                  if (warnings != null) newWarnings = sanitizeMessages(warnings, "warnings", details, name, void 0);
                }
              } catch (e) {
                newErrors = [extractErrorMessageV8(e, streamIn, details, note && note(), name)];
              }
              if (newErrors) {
                onEndErrors.push(...newErrors);
                try {
                  result.errors.push(...newErrors);
                } catch {
                }
              }
              if (newWarnings) {
                onEndWarnings.push(...newWarnings);
                try {
                  result.warnings.push(...newWarnings);
                } catch {
                }
              }
            }
            done(onEndErrors, onEndWarnings);
          })();
        };
      }
      let scheduleOnDisposeCallbacks = () => {
        for (const cb of onDisposeCallbacks) {
          setTimeout(() => cb(), 0);
        }
      };
      isSetupDone = true;
      return {
        ok: true,
        requestPlugins,
        runOnEndCallbacks,
        scheduleOnDisposeCallbacks
      };
    };
    function createObjectStash() {
      const map = /* @__PURE__ */ new Map();
      let nextID = 0;
      return {
        clear() {
          map.clear();
        },
        load(id) {
          return map.get(id);
        },
        store(value) {
          if (value === void 0) return -1;
          const id = nextID++;
          map.set(id, value);
          return id;
        }
      };
    }
    function extractCallerV8(e, streamIn, ident) {
      let note;
      let tried = false;
      return () => {
        if (tried) return note;
        tried = true;
        try {
          let lines = (e.stack + "").split("\n");
          lines.splice(1, 1);
          let location = parseStackLinesV8(streamIn, lines, ident);
          if (location) {
            note = { text: e.message, location };
            return note;
          }
        } catch {
        }
      };
    }
    function extractErrorMessageV8(e, streamIn, stash, note, pluginName) {
      let text = "Internal error";
      let location = null;
      try {
        text = (e && e.message || e) + "";
      } catch {
      }
      try {
        location = parseStackLinesV8(streamIn, (e.stack + "").split("\n"), "");
      } catch {
      }
      return { id: "", pluginName, text, location, notes: note ? [note] : [], detail: stash ? stash.store(e) : -1 };
    }
    function parseStackLinesV8(streamIn, lines, ident) {
      let at = "    at ";
      if (streamIn.readFileSync && !lines[0].startsWith(at) && lines[1].startsWith(at)) {
        for (let i = 1; i < lines.length; i++) {
          let line = lines[i];
          if (!line.startsWith(at)) continue;
          line = line.slice(at.length);
          while (true) {
            let match = /^(?:new |async )?\S+ \((.*)\)$/.exec(line);
            if (match) {
              line = match[1];
              continue;
            }
            match = /^eval at \S+ \((.*)\)(?:, \S+:\d+:\d+)?$/.exec(line);
            if (match) {
              line = match[1];
              continue;
            }
            match = /^(\S+):(\d+):(\d+)$/.exec(line);
            if (match) {
              let contents;
              try {
                contents = streamIn.readFileSync(match[1], "utf8");
              } catch {
                break;
              }
              let lineText = contents.split(/\r\n|\r|\n|\u2028|\u2029/)[+match[2] - 1] || "";
              let column = +match[3] - 1;
              let length = lineText.slice(column, column + ident.length) === ident ? ident.length : 0;
              return {
                file: match[1],
                namespace: "file",
                line: +match[2],
                column: encodeUTF8(lineText.slice(0, column)).length,
                length: encodeUTF8(lineText.slice(column, column + length)).length,
                lineText: lineText + "\n" + lines.slice(1).join("\n"),
                suggestion: ""
              };
            }
            break;
          }
        }
      }
      return null;
    }
    function failureErrorWithLog(text, errors, warnings) {
      let limit = 5;
      text += errors.length < 1 ? "" : ` with ${errors.length} error${errors.length < 2 ? "" : "s"}:` + errors.slice(0, limit + 1).map((e, i) => {
        if (i === limit) return "\n...";
        if (!e.location) return `
error: ${e.text}`;
        let { file, line, column } = e.location;
        let pluginText = e.pluginName ? `[plugin: ${e.pluginName}] ` : "";
        return `
${file}:${line}:${column}: ERROR: ${pluginText}${e.text}`;
      }).join("");
      let error = new Error(text);
      for (const [key, value] of [["errors", errors], ["warnings", warnings]]) {
        Object.defineProperty(error, key, {
          configurable: true,
          enumerable: true,
          get: () => value,
          set: (value2) => Object.defineProperty(error, key, {
            configurable: true,
            enumerable: true,
            value: value2
          })
        });
      }
      return error;
    }
    function replaceDetailsInMessages(messages, stash) {
      for (const message of messages) {
        message.detail = stash.load(message.detail);
      }
      return messages;
    }
    function sanitizeLocation(location, where, terminalWidth) {
      if (location == null) return null;
      let keys = {};
      let file = getFlag(location, keys, "file", mustBeString);
      let namespace = getFlag(location, keys, "namespace", mustBeString);
      let line = getFlag(location, keys, "line", mustBeInteger);
      let column = getFlag(location, keys, "column", mustBeInteger);
      let length = getFlag(location, keys, "length", mustBeInteger);
      let lineText = getFlag(location, keys, "lineText", mustBeString);
      let suggestion = getFlag(location, keys, "suggestion", mustBeString);
      checkForInvalidFlags(location, keys, where);
      if (lineText) {
        const relevantASCII = lineText.slice(
          0,
          (column && column > 0 ? column : 0) + (length && length > 0 ? length : 0) + (terminalWidth && terminalWidth > 0 ? terminalWidth : 80)
        );
        if (!/[\x7F-\uFFFF]/.test(relevantASCII) && !/\n/.test(lineText)) {
          lineText = relevantASCII;
        }
      }
      return {
        file: file || "",
        namespace: namespace || "",
        line: line || 0,
        column: column || 0,
        length: length || 0,
        lineText: lineText || "",
        suggestion: suggestion || ""
      };
    }
    function sanitizeMessages(messages, property, stash, fallbackPluginName, terminalWidth) {
      let messagesClone = [];
      let index = 0;
      for (const message of messages) {
        let keys = {};
        let id = getFlag(message, keys, "id", mustBeString);
        let pluginName = getFlag(message, keys, "pluginName", mustBeString);
        let text = getFlag(message, keys, "text", mustBeString);
        let location = getFlag(message, keys, "location", mustBeObjectOrNull);
        let notes = getFlag(message, keys, "notes", mustBeArray);
        let detail = getFlag(message, keys, "detail", canBeAnything);
        let where = `in element ${index} of "${property}"`;
        checkForInvalidFlags(message, keys, where);
        let notesClone = [];
        if (notes) {
          for (const note of notes) {
            let noteKeys = {};
            let noteText = getFlag(note, noteKeys, "text", mustBeString);
            let noteLocation = getFlag(note, noteKeys, "location", mustBeObjectOrNull);
            checkForInvalidFlags(note, noteKeys, where);
            notesClone.push({
              text: noteText || "",
              location: sanitizeLocation(noteLocation, where, terminalWidth)
            });
          }
        }
        messagesClone.push({
          id: id || "",
          pluginName: pluginName || fallbackPluginName,
          text: text || "",
          location: sanitizeLocation(location, where, terminalWidth),
          notes: notesClone,
          detail: stash ? stash.store(detail) : -1
        });
        index++;
      }
      return messagesClone;
    }
    function sanitizeStringArray(values, property) {
      const result = [];
      for (const value of values) {
        if (typeof value !== "string") throw new Error(`${quote(property)} must be an array of strings`);
        result.push(value);
      }
      return result;
    }
    function sanitizeStringMap(map, property) {
      const result = /* @__PURE__ */ Object.create(null);
      for (const key in map) {
        const value = map[key];
        if (typeof value !== "string") throw new Error(`key ${quote(key)} in object ${quote(property)} must be a string`);
        result[key] = value;
      }
      return result;
    }
    function convertOutputFiles({ path: path3, contents, hash }) {
      let text = null;
      return {
        path: path3,
        contents,
        hash,
        get text() {
          const binary = this.contents;
          if (text === null || binary !== contents) {
            contents = binary;
            text = decodeUTF8(binary);
          }
          return text;
        }
      };
    }
    function jsRegExpToGoRegExp(regexp) {
      let result = regexp.source;
      if (regexp.flags) result = `(?${regexp.flags})${result}`;
      return result;
    }
    function parseJSON(bytes) {
      let text;
      try {
        text = decodeUTF8(bytes);
      } catch {
        return JSON_parse(bytes);
      }
      return JSON.parse(text);
    }
    var fs = __require("fs");
    var os = __require("os");
    var path2 = __require("path");
    var ESBUILD_BINARY_PATH = process.env.ESBUILD_BINARY_PATH || ESBUILD_BINARY_PATH;
    var isValidBinaryPath = (x) => !!x && x !== "/usr/bin/esbuild";
    var packageDarwin_arm64 = "@esbuild/darwin-arm64";
    var packageDarwin_x64 = "@esbuild/darwin-x64";
    var knownWindowsPackages = {
      "win32 arm64 LE": "@esbuild/win32-arm64",
      "win32 ia32 LE": "@esbuild/win32-ia32",
      "win32 x64 LE": "@esbuild/win32-x64"
    };
    var knownUnixlikePackages = {
      "aix ppc64 BE": "@esbuild/aix-ppc64",
      "android arm64 LE": "@esbuild/android-arm64",
      "darwin arm64 LE": "@esbuild/darwin-arm64",
      "darwin x64 LE": "@esbuild/darwin-x64",
      "freebsd arm64 LE": "@esbuild/freebsd-arm64",
      "freebsd x64 LE": "@esbuild/freebsd-x64",
      "linux arm LE": "@esbuild/linux-arm",
      "linux arm64 LE": "@esbuild/linux-arm64",
      "linux ia32 LE": "@esbuild/linux-ia32",
      "linux mips64el LE": "@esbuild/linux-mips64el",
      "linux ppc64 LE": "@esbuild/linux-ppc64",
      "linux riscv64 LE": "@esbuild/linux-riscv64",
      "linux s390x BE": "@esbuild/linux-s390x",
      "linux x64 LE": "@esbuild/linux-x64",
      "linux loong64 LE": "@esbuild/linux-loong64",
      "netbsd arm64 LE": "@esbuild/netbsd-arm64",
      "netbsd x64 LE": "@esbuild/netbsd-x64",
      "openbsd arm64 LE": "@esbuild/openbsd-arm64",
      "openbsd x64 LE": "@esbuild/openbsd-x64",
      "sunos x64 LE": "@esbuild/sunos-x64"
    };
    var knownWebAssemblyFallbackPackages = {
      "android arm LE": "@esbuild/android-arm",
      "android x64 LE": "@esbuild/android-x64",
      "openharmony arm64 LE": "@esbuild/openharmony-arm64"
    };
    function pkgAndSubpathForCurrentPlatform() {
      let pkg;
      let subpath;
      let isWASM = false;
      let platformKey = `${process.platform} ${os.arch()} ${os.endianness()}`;
      if (platformKey in knownWindowsPackages) {
        pkg = knownWindowsPackages[platformKey];
        subpath = "esbuild.exe";
      } else if (platformKey in knownUnixlikePackages) {
        pkg = knownUnixlikePackages[platformKey];
        subpath = "bin/esbuild";
      } else if (platformKey in knownWebAssemblyFallbackPackages) {
        pkg = knownWebAssemblyFallbackPackages[platformKey];
        subpath = "bin/esbuild";
        isWASM = true;
      } else {
        throw new Error(`Unsupported platform: ${platformKey}`);
      }
      return { pkg, subpath, isWASM };
    }
    function pkgForSomeOtherPlatform() {
      const libMainJS = __require.resolve("esbuild");
      const nodeModulesDirectory = path2.dirname(path2.dirname(path2.dirname(libMainJS)));
      if (path2.basename(nodeModulesDirectory) === "node_modules") {
        for (const unixKey in knownUnixlikePackages) {
          try {
            const pkg = knownUnixlikePackages[unixKey];
            if (fs.existsSync(path2.join(nodeModulesDirectory, pkg))) return pkg;
          } catch {
          }
        }
        for (const windowsKey in knownWindowsPackages) {
          try {
            const pkg = knownWindowsPackages[windowsKey];
            if (fs.existsSync(path2.join(nodeModulesDirectory, pkg))) return pkg;
          } catch {
          }
        }
      }
      return null;
    }
    function downloadedBinPath(pkg, subpath) {
      const esbuildLibDir = path2.dirname(__require.resolve("esbuild"));
      return path2.join(esbuildLibDir, `downloaded-${pkg.replace("/", "-")}-${path2.basename(subpath)}`);
    }
    function generateBinPath() {
      if (isValidBinaryPath(ESBUILD_BINARY_PATH)) {
        if (!fs.existsSync(ESBUILD_BINARY_PATH)) {
          console.warn(`[esbuild] Ignoring bad configuration: ESBUILD_BINARY_PATH=${ESBUILD_BINARY_PATH}`);
        } else {
          return { binPath: ESBUILD_BINARY_PATH, isWASM: false };
        }
      }
      const { pkg, subpath, isWASM } = pkgAndSubpathForCurrentPlatform();
      let binPath;
      try {
        binPath = __require.resolve(`${pkg}/${subpath}`);
      } catch (e) {
        binPath = downloadedBinPath(pkg, subpath);
        if (!fs.existsSync(binPath)) {
          try {
            __require.resolve(pkg);
          } catch {
            const otherPkg = pkgForSomeOtherPlatform();
            if (otherPkg) {
              let suggestions = `
Specifically the "${otherPkg}" package is present but this platform
needs the "${pkg}" package instead. People often get into this
situation by installing esbuild on Windows or macOS and copying "node_modules"
into a Docker image that runs Linux, or by copying "node_modules" between
Windows and WSL environments.

If you are installing with npm, you can try not copying the "node_modules"
directory when you copy the files over, and running "npm ci" or "npm install"
on the destination platform after the copy. Or you could consider using yarn
instead of npm which has built-in support for installing a package on multiple
platforms simultaneously.

If you are installing with yarn, you can try listing both this platform and the
other platform in your ".yarnrc.yml" file using the "supportedArchitectures"
feature: https://yarnpkg.com/configuration/yarnrc/#supportedArchitectures
Keep in mind that this means multiple copies of esbuild will be present.
`;
              if (pkg === packageDarwin_x64 && otherPkg === packageDarwin_arm64 || pkg === packageDarwin_arm64 && otherPkg === packageDarwin_x64) {
                suggestions = `
Specifically the "${otherPkg}" package is present but this platform
needs the "${pkg}" package instead. People often get into this
situation by installing esbuild with npm running inside of Rosetta 2 and then
trying to use it with node running outside of Rosetta 2, or vice versa (Rosetta
2 is Apple's on-the-fly x86_64-to-arm64 translation service).

If you are installing with npm, you can try ensuring that both npm and node are
not running under Rosetta 2 and then reinstalling esbuild. This likely involves
changing how you installed npm and/or node. For example, installing node with
the universal installer here should work: https://nodejs.org/en/download/. Or
you could consider using yarn instead of npm which has built-in support for
installing a package on multiple platforms simultaneously.

If you are installing with yarn, you can try listing both "arm64" and "x64"
in your ".yarnrc.yml" file using the "supportedArchitectures" feature:
https://yarnpkg.com/configuration/yarnrc/#supportedArchitectures
Keep in mind that this means multiple copies of esbuild will be present.
`;
              }
              throw new Error(`
You installed esbuild for another platform than the one you're currently using.
This won't work because esbuild is written with native code and needs to
install a platform-specific binary executable.
${suggestions}
Another alternative is to use the "esbuild-wasm" package instead, which works
the same way on all platforms. But it comes with a heavy performance cost and
can sometimes be 10x slower than the "esbuild" package, so you may also not
want to do that.
`);
            }
            throw new Error(`The package "${pkg}" could not be found, and is needed by esbuild.

If you are installing esbuild with npm, make sure that you don't specify the
"--no-optional" or "--omit=optional" flags. The "optionalDependencies" feature
of "package.json" is used by esbuild to install the correct binary executable
for your current platform.`);
          }
          throw e;
        }
      }
      if (/\.zip\//.test(binPath)) {
        let pnpapi;
        try {
          pnpapi = __require("pnpapi");
        } catch (e) {
        }
        if (pnpapi) {
          const root = pnpapi.getPackageInformation(pnpapi.topLevel).packageLocation;
          const binTargetPath = path2.join(
            root,
            "node_modules",
            ".cache",
            "esbuild",
            `pnpapi-${pkg.replace("/", "-")}-${"0.28.1"}-${path2.basename(subpath)}`
          );
          if (!fs.existsSync(binTargetPath)) {
            fs.mkdirSync(path2.dirname(binTargetPath), { recursive: true });
            fs.copyFileSync(binPath, binTargetPath);
            fs.chmodSync(binTargetPath, 493);
          }
          return { binPath: binTargetPath, isWASM };
        }
      }
      return { binPath, isWASM };
    }
    var child_process = __require("child_process");
    var crypto = __require("crypto");
    var path22 = __require("path");
    var fs2 = __require("fs");
    var os2 = __require("os");
    var tty = __require("tty");
    var worker_threads;
    if (process.env.ESBUILD_WORKER_THREADS !== "0") {
      try {
        worker_threads = __require("worker_threads");
      } catch {
      }
      let [major, minor] = process.versions.node.split(".");
      if (
        // <v12.17.0 does not work
        +major < 12 || +major === 12 && +minor < 17 || +major === 13 && +minor < 13
      ) {
        worker_threads = void 0;
      }
    }
    var _a;
    var isInternalWorkerThread = ((_a = worker_threads == null ? void 0 : worker_threads.workerData) == null ? void 0 : _a.esbuildVersion) === "0.28.1";
    var esbuildCommandAndArgs = () => {
      if ((!ESBUILD_BINARY_PATH || false) && (path22.basename(__filename) !== "main.js" || path22.basename(__dirname) !== "lib")) {
        throw new Error(
          `The esbuild JavaScript API cannot be bundled. Please mark the "esbuild" package as external so it's not included in the bundle.

More information: The file containing the code for esbuild's JavaScript API (${__filename}) does not appear to be inside the esbuild package on the file system, which usually means that the esbuild package was bundled into another file. This is problematic because the API needs to run a binary executable inside the esbuild package which is located using a relative path from the API code to the executable. If the esbuild package is bundled, the relative path will be incorrect and the executable won't be found.`
        );
      }
      if (false) {
        return ["node", [path22.join(__dirname, "..", "bin", "esbuild")]];
      } else {
        const { binPath, isWASM } = generateBinPath();
        if (isWASM) {
          return ["node", [binPath]];
        } else {
          return [binPath, []];
        }
      }
    };
    var isTTY = () => tty.isatty(2);
    var fsSync = {
      readFile(tempFile, callback) {
        try {
          let contents = fs2.readFileSync(tempFile, "utf8");
          try {
            fs2.unlinkSync(tempFile);
          } catch {
          }
          callback(null, contents);
        } catch (err) {
          callback(err, null);
        }
      },
      writeFile(contents, callback) {
        try {
          let tempFile = randomFileName();
          fs2.writeFileSync(tempFile, contents);
          callback(tempFile);
        } catch {
          callback(null);
        }
      }
    };
    var fsAsync = {
      readFile(tempFile, callback) {
        try {
          fs2.readFile(tempFile, "utf8", (err, contents) => {
            try {
              fs2.unlink(tempFile, () => callback(err, contents));
            } catch {
              callback(err, contents);
            }
          });
        } catch (err) {
          callback(err, null);
        }
      },
      writeFile(contents, callback) {
        try {
          let tempFile = randomFileName();
          fs2.writeFile(tempFile, contents, (err) => err !== null ? callback(null) : callback(tempFile));
        } catch {
          callback(null);
        }
      }
    };
    var version = "0.28.1";
    var build = (options) => ensureServiceIsRunning().build(options);
    var context = (buildOptions) => ensureServiceIsRunning().context(buildOptions);
    var transform = (input, options) => ensureServiceIsRunning().transform(input, options);
    var formatMessages = (messages, options) => ensureServiceIsRunning().formatMessages(messages, options);
    var analyzeMetafile = (messages, options) => ensureServiceIsRunning().analyzeMetafile(messages, options);
    var buildSync = (options) => {
      if (worker_threads && !isInternalWorkerThread) {
        if (!workerThreadService) workerThreadService = startWorkerThreadService(worker_threads);
        return workerThreadService.buildSync(options);
      }
      let result;
      runServiceSync((service) => service.buildOrContext({
        callName: "buildSync",
        refs: null,
        options,
        isTTY: isTTY(),
        defaultWD,
        callback: (err, res) => {
          if (err) throw err;
          result = res;
        }
      }));
      return result;
    };
    var transformSync = (input, options) => {
      if (worker_threads && !isInternalWorkerThread) {
        if (!workerThreadService) workerThreadService = startWorkerThreadService(worker_threads);
        return workerThreadService.transformSync(input, options);
      }
      let result;
      runServiceSync((service) => service.transform({
        callName: "transformSync",
        refs: null,
        input,
        options: options || {},
        isTTY: isTTY(),
        fs: fsSync,
        callback: (err, res) => {
          if (err) throw err;
          result = res;
        }
      }));
      return result;
    };
    var formatMessagesSync = (messages, options) => {
      if (worker_threads && !isInternalWorkerThread) {
        if (!workerThreadService) workerThreadService = startWorkerThreadService(worker_threads);
        return workerThreadService.formatMessagesSync(messages, options);
      }
      let result;
      runServiceSync((service) => service.formatMessages({
        callName: "formatMessagesSync",
        refs: null,
        messages,
        options,
        callback: (err, res) => {
          if (err) throw err;
          result = res;
        }
      }));
      return result;
    };
    var analyzeMetafileSync = (metafile, options) => {
      if (worker_threads && !isInternalWorkerThread) {
        if (!workerThreadService) workerThreadService = startWorkerThreadService(worker_threads);
        return workerThreadService.analyzeMetafileSync(metafile, options);
      }
      let result;
      runServiceSync((service) => service.analyzeMetafile({
        callName: "analyzeMetafileSync",
        refs: null,
        metafile: typeof metafile === "string" ? metafile : JSON.stringify(metafile),
        options,
        callback: (err, res) => {
          if (err) throw err;
          result = res;
        }
      }));
      return result;
    };
    var stop = () => {
      if (stopService) stopService();
      if (workerThreadService) workerThreadService.stop();
      return Promise.resolve();
    };
    var initializeWasCalled = false;
    var initialize = (options) => {
      options = validateInitializeOptions(options || {});
      if (options.wasmURL) throw new Error(`The "wasmURL" option only works in the browser`);
      if (options.wasmModule) throw new Error(`The "wasmModule" option only works in the browser`);
      if (options.worker) throw new Error(`The "worker" option only works in the browser`);
      if (initializeWasCalled) throw new Error('Cannot call "initialize" more than once');
      ensureServiceIsRunning();
      initializeWasCalled = true;
      return Promise.resolve();
    };
    var defaultWD = process.cwd();
    var longLivedService;
    var stopService;
    var ensureServiceIsRunning = () => {
      if (longLivedService) return longLivedService;
      let [command, args] = esbuildCommandAndArgs();
      let child = child_process.spawn(command, args.concat(`--service=${"0.28.1"}`, "--ping"), {
        windowsHide: true,
        stdio: ["pipe", "pipe", "inherit"],
        cwd: defaultWD
      });
      let { readFromStdout, afterClose, service } = createChannel({
        writeToStdin(bytes) {
          child.stdin.write(bytes, (err) => {
            if (err) afterClose(err);
          });
        },
        readFileSync: fs2.readFileSync,
        isSync: false,
        hasFS: true,
        esbuild: node_exports
      });
      child.stdin.on("error", afterClose);
      child.on("error", afterClose);
      const stdin = child.stdin;
      const stdout = child.stdout;
      stdout.on("data", readFromStdout);
      stdout.on("end", afterClose);
      stopService = () => {
        stdin.destroy();
        stdout.destroy();
        child.kill();
        initializeWasCalled = false;
        longLivedService = void 0;
        stopService = void 0;
      };
      let refCount = 0;
      child.unref();
      if (stdin.unref) {
        stdin.unref();
      }
      if (stdout.unref) {
        stdout.unref();
      }
      const refs = {
        ref() {
          if (++refCount === 1) child.ref();
        },
        unref() {
          if (--refCount === 0) child.unref();
        }
      };
      longLivedService = {
        build: (options) => new Promise((resolve7, reject) => {
          service.buildOrContext({
            callName: "build",
            refs,
            options,
            isTTY: isTTY(),
            defaultWD,
            callback: (err, res) => err ? reject(err) : resolve7(res)
          });
        }),
        context: (options) => new Promise((resolve7, reject) => service.buildOrContext({
          callName: "context",
          refs,
          options,
          isTTY: isTTY(),
          defaultWD,
          callback: (err, res) => err ? reject(err) : resolve7(res)
        })),
        transform: (input, options) => new Promise((resolve7, reject) => service.transform({
          callName: "transform",
          refs,
          input,
          options: options || {},
          isTTY: isTTY(),
          fs: fsAsync,
          callback: (err, res) => err ? reject(err) : resolve7(res)
        })),
        formatMessages: (messages, options) => new Promise((resolve7, reject) => service.formatMessages({
          callName: "formatMessages",
          refs,
          messages,
          options,
          callback: (err, res) => err ? reject(err) : resolve7(res)
        })),
        analyzeMetafile: (metafile, options) => new Promise((resolve7, reject) => service.analyzeMetafile({
          callName: "analyzeMetafile",
          refs,
          metafile: typeof metafile === "string" ? metafile : JSON.stringify(metafile),
          options,
          callback: (err, res) => err ? reject(err) : resolve7(res)
        }))
      };
      return longLivedService;
    };
    var runServiceSync = (callback) => {
      let [command, args] = esbuildCommandAndArgs();
      let stdin = new Uint8Array();
      let { readFromStdout, afterClose, service } = createChannel({
        writeToStdin(bytes) {
          if (stdin.length !== 0) throw new Error("Must run at most one command");
          stdin = bytes;
        },
        isSync: true,
        hasFS: true,
        esbuild: node_exports
      });
      callback(service);
      let stdout = child_process.execFileSync(command, args.concat(`--service=${"0.28.1"}`), {
        cwd: defaultWD,
        windowsHide: true,
        input: stdin,
        // We don't know how large the output could be. If it's too large, the
        // command will fail with ENOBUFS. Reserve 16mb for now since that feels
        // like it should be enough. Also allow overriding this with an environment
        // variable.
        maxBuffer: +process.env.ESBUILD_MAX_BUFFER || 16 * 1024 * 1024
      });
      readFromStdout(stdout);
      afterClose(null);
    };
    var randomFileName = () => {
      return path22.join(os2.tmpdir(), `esbuild-${crypto.randomBytes(32).toString("hex")}`);
    };
    var workerThreadService = null;
    var startWorkerThreadService = (worker_threads2) => {
      let { port1: mainPort, port2: workerPort } = new worker_threads2.MessageChannel();
      let worker = new worker_threads2.Worker(__filename, {
        workerData: { workerPort, defaultWD, esbuildVersion: "0.28.1" },
        transferList: [workerPort],
        // From node's documentation: https://nodejs.org/api/worker_threads.html
        //
        //   Take care when launching worker threads from preload scripts (scripts loaded
        //   and run using the `-r` command line flag). Unless the `execArgv` option is
        //   explicitly set, new Worker threads automatically inherit the command line flags
        //   from the running process and will preload the same preload scripts as the main
        //   thread. If the preload script unconditionally launches a worker thread, every
        //   thread spawned will spawn another until the application crashes.
        //
        execArgv: []
      });
      let nextID = 0;
      let fakeBuildError = (text) => {
        let error = new Error(`Build failed with 1 error:
error: ${text}`);
        let errors = [{ id: "", pluginName: "", text, location: null, notes: [], detail: void 0 }];
        error.errors = errors;
        error.warnings = [];
        return error;
      };
      let validateBuildSyncOptions = (options) => {
        if (!options) return;
        let plugins = options.plugins;
        if (plugins && plugins.length > 0) throw fakeBuildError(`Cannot use plugins in synchronous API calls`);
      };
      let applyProperties = (object, properties) => {
        for (let key in properties) {
          object[key] = properties[key];
        }
      };
      let runCallSync = (command, args) => {
        let id = nextID++;
        let sharedBuffer = new SharedArrayBuffer(8);
        let sharedBufferView = new Int32Array(sharedBuffer);
        let msg = { sharedBuffer, id, command, args };
        worker.postMessage(msg);
        let status = Atomics.wait(sharedBufferView, 0, 0);
        if (status !== "ok" && status !== "not-equal") throw new Error("Internal error: Atomics.wait() failed: " + status);
        let { message: { id: id2, resolve: resolve7, reject, properties } } = worker_threads2.receiveMessageOnPort(mainPort);
        if (id !== id2) throw new Error(`Internal error: Expected id ${id} but got id ${id2}`);
        if (reject) {
          applyProperties(reject, properties);
          throw reject;
        }
        return resolve7;
      };
      worker.unref();
      return {
        buildSync(options) {
          validateBuildSyncOptions(options);
          return runCallSync("build", [options]);
        },
        transformSync(input, options) {
          return runCallSync("transform", [input, options]);
        },
        formatMessagesSync(messages, options) {
          return runCallSync("formatMessages", [messages, options]);
        },
        analyzeMetafileSync(metafile, options) {
          return runCallSync("analyzeMetafile", [metafile, options]);
        },
        stop() {
          worker.terminate();
          workerThreadService = null;
        }
      };
    };
    var startSyncServiceWorker = () => {
      let workerPort = worker_threads.workerData.workerPort;
      let parentPort = worker_threads.parentPort;
      let extractProperties = (object) => {
        let properties = {};
        if (object && typeof object === "object") {
          for (let key in object) {
            properties[key] = object[key];
          }
        }
        return properties;
      };
      try {
        let service = ensureServiceIsRunning();
        defaultWD = worker_threads.workerData.defaultWD;
        parentPort.on("message", (msg) => {
          (async () => {
            let { sharedBuffer, id, command, args } = msg;
            let sharedBufferView = new Int32Array(sharedBuffer);
            try {
              switch (command) {
                case "build":
                  workerPort.postMessage({ id, resolve: await service.build(args[0]) });
                  break;
                case "transform":
                  workerPort.postMessage({ id, resolve: await service.transform(args[0], args[1]) });
                  break;
                case "formatMessages":
                  workerPort.postMessage({ id, resolve: await service.formatMessages(args[0], args[1]) });
                  break;
                case "analyzeMetafile":
                  workerPort.postMessage({ id, resolve: await service.analyzeMetafile(args[0], args[1]) });
                  break;
                default:
                  throw new Error(`Invalid command: ${command}`);
              }
            } catch (reject) {
              workerPort.postMessage({ id, reject, properties: extractProperties(reject) });
            }
            Atomics.add(sharedBufferView, 0, 1);
            Atomics.notify(sharedBufferView, 0, Infinity);
          })();
        });
      } catch (reject) {
        parentPort.on("message", (msg) => {
          let { sharedBuffer, id } = msg;
          let sharedBufferView = new Int32Array(sharedBuffer);
          workerPort.postMessage({ id, reject, properties: extractProperties(reject) });
          Atomics.add(sharedBufferView, 0, 1);
          Atomics.notify(sharedBufferView, 0, Infinity);
        });
      }
    };
    if (isInternalWorkerThread) {
      startSyncServiceWorker();
    }
    var node_default = node_exports;
  }
});

// node_modules/.pnpm/commander@13.1.0/node_modules/commander/esm.mjs
var import_index = __toESM(require_commander(), 1);
var {
  program,
  createCommand,
  createArgument,
  createOption,
  CommanderError,
  InvalidArgumentError,
  InvalidOptionArgumentError,
  // deprecated old name
  Command,
  Argument,
  Option,
  Help
} = import_index.default;

// node_modules/.pnpm/dotenv@16.6.1/node_modules/dotenv/config.js
(function() {
  require_main().config(
    Object.assign(
      {},
      require_env_options(),
      require_cli_options()(process.argv)
    )
  );
})();

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path: path2, errorMaps, issueData } = params;
  const fullPath = [...path2, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path2, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path2;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = /* @__PURE__ */ Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: ((arg) => ZodString.create({ ...arg, coerce: true })),
  number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
  boolean: ((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })),
  bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
  date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
};
var NEVER = INVALID;

// src/config/load-config.ts
init_errors();
var booleanSchema = external_exports.union([external_exports.boolean(), external_exports.string()]).transform((value) => {
  if (typeof value === "boolean") return value;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
});
var numberSchema = external_exports.union([external_exports.number(), external_exports.string()]).transform((value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid number: ${value}`);
  }
  return parsed;
});
var configSchema = external_exports.object({
  apiBaseUrl: external_exports.string().url(),
  apiToken: external_exports.string().optional(),
  profileId: external_exports.string().optional(),
  headless: booleanSchema,
  bidiConnectTimeoutMs: numberSchema,
  bidiCommandTimeoutMs: numberSchema
});
function loadConfig(overrides = {}) {
  let parsed;
  try {
    parsed = configSchema.parse({
      apiBaseUrl: overrides.api ?? process.env.DONUT_API_BASE_URL ?? "http://127.0.0.1:10108",
      apiToken: (overrides.token ?? process.env.DONUT_API_TOKEN) || void 0,
      profileId: (overrides.profile ?? process.env.DONUT_PROFILE_ID) || void 0,
      headless: overrides.headless ?? process.env.DONUT_HEADLESS ?? process.env.CAMOUFOX_HEADLESS ?? false,
      bidiConnectTimeoutMs: overrides.connectTimeout ?? process.env.BIDI_CONNECT_TIMEOUT_MS ?? 3e4,
      bidiCommandTimeoutMs: overrides.commandTimeout ?? process.env.BIDI_COMMAND_TIMEOUT_MS ?? 15e3
    });
  } catch (error) {
    if (error instanceof external_exports.ZodError) {
      const issues = error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
      throw new AppError(`Invalid configuration:
${issues}`);
    }
    throw error;
  }
  return {
    ...parsed,
    apiBaseUrl: parsed.apiBaseUrl.replace(/\/$/, "")
  };
}

// src/runtime/create-flow-script.ts
init_errors();
import { mkdir, stat, writeFile } from "fs/promises";
import { extname, isAbsolute, join, relative, resolve, sep } from "path";

// src/ui/ui-provider.ts
import { createRequire } from "node:module";
import * as readline from "readline";
var require2 = createRequire(import.meta.url);
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}
function readlineQuestion(rl, query) {
  return new Promise((resolve7) => {
    rl.question(query, (answer) => {
      resolve7(answer);
    });
  });
}
async function readlineListPicker(args) {
  const { title, options, initialValue, submitHint = "select", cancelHint = "back" } = args;
  if (options.length === 0) return void 0;
  const rl = createReadlineInterface();
  try {
    console.log(`
${title}
`);
    let selectedIndex = initialValue ? options.findIndex((o) => o.value === initialValue) : 0;
    if (selectedIndex < 0) selectedIndex = 0;
    options.forEach((option, index) => {
      const prefix = index === selectedIndex ? "> " : "  ";
      const marker = index === selectedIndex ? " *" : "";
      console.log(`${prefix}${option.label}${marker}`);
    });
    console.log(`
[Enter] ${submitHint}   [Esc] ${cancelHint}   [\u2191\u2193] move
`);
    const answer = await readlineQuestion(rl, "Choose number (0-" + (options.length - 1) + "): ");
    const num = parseInt(answer, 10);
    if (isNaN(num) || num < 0 || num >= options.length) return void 0;
    return options[num].value;
  } finally {
    rl.close();
  }
}
async function readlineTextInput(args) {
  const { title, defaultValue = "" } = args;
  const rl = createReadlineInterface();
  try {
    console.log(`
${title}`);
    const answer = await readlineQuestion(rl, `> ${defaultValue ? `[${defaultValue}]: ` : ""}`);
    if (answer === "" && defaultValue) return defaultValue;
    return answer || void 0;
  } finally {
    rl.close();
  }
}
async function readlineUpdatePrompt(update) {
  const rl = createReadlineInterface();
  try {
    console.log(`
Update available: ${update.currentVersion} \u2192 ${update.latestVersion}`);
    console.log(`Asset: ${update.assetName}`);
    console.log(`Release: ${update.releaseUrl}
`);
    const answer = await readlineQuestion(rl, "Install update now? (y/n): ");
    if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") return "install";
    return "skip";
  } finally {
    rl.close();
  }
}
async function readlineFlowScriptEditor(args) {
  console.log(`
Create flow script: ${args.filePath}`);
  console.log("Flow script editor is not available in headless mode.");
  console.log("Please edit the file manually after creation.\n");
  return args.initialSource;
}
var readlineUi = {
  runListPicker: readlineListPicker,
  runTextInputPrompt: readlineTextInput,
  runUpdatePrompt: readlineUpdatePrompt,
  runFlowScriptEditor: readlineFlowScriptEditor
};
var _ui;
async function getUi() {
  if (!_ui) {
    const useReadline = process.env.DONUMATE_READLINE === "1" || process.env.DONUMATE_READLINE === "true" || !process.stdin.isTTY;
    if (useReadline) {
      _ui = readlineUi;
    } else {
      const { inkUi: inkUi2 } = await Promise.resolve().then(() => (init_ui_ink(), ui_ink_exports));
      _ui = inkUi2;
    }
  }
  return _ui;
}

// src/runtime/create-flow-script.ts
init_parser();
var FLOW_TEMPLATE = `inputs {
}

before() {
}

running() {

}

after() {
}
`;
function toPosixPath(path2) {
  return path2.split(sep).join("/");
}
async function pathExists(path2) {
  return stat(path2).then(() => true, () => false);
}
function normalizeFlowScriptName(value) {
  const trimmed = value.trim();
  if (!trimmed) throw new AppError("Script name is required.");
  if (trimmed.includes("/") || trimmed.includes("\\")) throw new AppError("Script name cannot include folders.");
  if (trimmed.includes("..")) throw new AppError('Script name cannot include "..".');
  if (isAbsolute(trimmed)) throw new AppError("Script name must not be an absolute path.");
  const extension2 = extname(trimmed);
  if (extension2 && extension2.toLowerCase() !== ".flow") throw new AppError("Script name must use .flow extension.");
  return extension2 ? trimmed : `${trimmed}.flow`;
}
async function createFlowScript() {
  const scriptsDir = resolve(process.cwd(), "scripts");
  const ui = await getUi();
  const scriptName = await ui.runTextInputPrompt({
    title: "Create flow script: script name",
    validate: (value) => {
      try {
        normalizeFlowScriptName(value);
        return void 0;
      } catch (error) {
        return error instanceof Error ? error.message : String(error);
      }
    }
  });
  if (scriptName === void 0) return void 0;
  const fileName = normalizeFlowScriptName(scriptName);
  const filePath = join(scriptsDir, fileName);
  if (await pathExists(filePath)) throw new AppError(`Flow script already exists: ${toPosixPath(relative(process.cwd(), filePath))}`);
  const source = await ui.runFlowScriptEditor({
    filePath: toPosixPath(relative(process.cwd(), filePath)),
    initialSource: FLOW_TEMPLATE
  });
  if (source === void 0) return void 0;
  parseFlowProgram(source);
  await mkdir(scriptsDir, { recursive: true });
  await writeFile(filePath, source, "utf8");
  return toPosixPath(relative(process.cwd(), filePath));
}

// src/runtime/dsl/checker.ts
init_errors();
init_parser();
init_runtime_spec();
function formatFlowDiagnostic(diag2, source) {
  const header = `${diag2.filePath}:${diag2.lineNumber}:1 - ${diag2.severity} ${diag2.code}: ${diag2.message}`;
  if (!source) return header;
  const lines = source.split(/\r?\n/);
  const line = lines[diag2.lineNumber - 1];
  if (line === void 0) return header;
  return `${header}

${diag2.lineNumber} | ${line}
${" ".repeat(String(diag2.lineNumber).length)} | ^`;
}
var BUILTIN_VARS = /* @__PURE__ */ new Set(["profileid", "profilename", "profileproxy", "hardless"]);
function checkFlowSource(source, filePath) {
  try {
    return checkFlowProgram(parseFlowProgram(source), filePath);
  } catch (error) {
    return { diagnostics: [{ severity: "error", code: "FLOW_PARSE", filePath, lineNumber: 1, message: error instanceof AppError ? error.message : String(error) }] };
  }
}
function checkFlowProgram(program3, filePath) {
  const diagnostics = [];
  const baseVars = new Set(BUILTIN_VARS);
  for (const input of program3.inputs) baseVars.add(input.name.toLowerCase());
  const shared = /* @__PURE__ */ new Map();
  for (const name of baseVars) shared.set(name, { defined: "yes", lineNumber: 0 });
  for (const input of program3.inputs) {
    if (input.type === "inputExcelFile") shared.set(`${input.name.toLowerCase()}totalrow`, { defined: "yes", lineNumber: input.lineNumber });
  }
  checkStatements(program3.beforeRunProfile, "beforeRunProfile", filePath, diagnostics, shared);
  checkStatements(program3.main, "main", filePath, diagnostics, shared);
  checkStatements(program3.afterKillProfile, "afterKillProfile", filePath, diagnostics, shared);
  return { diagnostics };
}
function checkStatements(statements, block, filePath, diagnostics, vars) {
  let scope = new Map(vars);
  for (const statement of statements) {
    if (statement.type === "command") {
      const spec = getFlowCommandSpec(statement.command);
      const args = stripTrailingRDelay(statement.args);
      if (!spec) diagnostics.push(diag("error", "FLOW_CMD_UNKNOWN", filePath, statement.lineNumber, `Unknown command "${statement.command}".`));
      else if (args.length < spec.minArgs || args.length > spec.maxArgs) diagnostics.push(diag("error", "FLOW_CMD_ARGS", filePath, statement.lineNumber, `${spec.name} expected ${range(spec.minArgs, spec.maxArgs)} args, got ${args.length}.`));
      else if (block !== "main" && spec.pageOnly) diagnostics.push(diag("error", "FLOW_BLOCK_PAGE_ONLY", filePath, statement.lineNumber, `${statement.command} can only be used inside running() block.`));
      for (const arg of args) scanInterpolation(arg, filePath, statement.lineNumber, diagnostics, scope);
      for (const eff of spec?.sideEffects ?? []) scope.set(eff.toLowerCase(), { defined: "yes", lineNumber: statement.lineNumber });
      continue;
    }
    if (statement.type === "assignment") {
      scanExpression(statement.value, filePath, statement.lineNumber, diagnostics, scope);
      scope.set(statement.name.toLowerCase(), { defined: "yes", lineNumber: statement.lineNumber });
      continue;
    }
    if (statement.type === "if") {
      for (const branch of statement.branches) scanExpression(branch.condition, filePath, branch.lineNumber, diagnostics, scope);
      const branchScopes = statement.branches.map((branch) => checkStatements(branch.body, block, filePath, diagnostics, new Map(scope)));
      if (statement.elseBody) branchScopes.push(checkStatements(statement.elseBody, block, filePath, diagnostics, new Map(scope)));
      scope = mergeScopes(scope, branchScopes);
      continue;
    }
    if (statement.type === "while") {
      scanExpression(statement.condition, filePath, statement.lineNumber, diagnostics, scope);
      const bodyScope = checkStatements(statement.body, block, filePath, diagnostics, new Map(scope));
      scope = mergeLoopScope(scope, bodyScope);
      continue;
    }
    if (statement.type === "for") {
      scanExpression(statement.init.value, filePath, statement.lineNumber, diagnostics, scope);
      scope.set(statement.init.name.toLowerCase(), { defined: "yes", lineNumber: statement.lineNumber });
      scanExpression(statement.condition, filePath, statement.lineNumber, diagnostics, scope);
      scanExpression(statement.update.value, filePath, statement.lineNumber, diagnostics, scope);
      scope.set(statement.update.name.toLowerCase(), { defined: "yes", lineNumber: statement.lineNumber });
      const bodyScope = checkStatements(statement.body, block, filePath, diagnostics, new Map(scope));
      scope = mergeLoopScope(scope, bodyScope);
      continue;
    }
  }
  return scope;
}
function scanInterpolation(text, filePath, lineNumber, diagnostics, vars) {
  for (const match of text.matchAll(/\$\{([^}]+)\}/g)) scanExpression(parseExpression(match[1] ?? "", lineNumber), filePath, lineNumber, diagnostics, vars);
}
function scanExpression(expr, filePath, lineNumber, diagnostics, vars) {
  switch (expr.type) {
    case "variable":
      if (!vars.has(expr.name.toLowerCase())) diagnostics.push(diag("error", "FLOW_VAR_UNDEFINED", filePath, lineNumber, `Variable "${expr.name}" is not defined.`));
      return;
    case "call": {
      const spec = getFlowFunctionSpec(expr.name);
      if (!spec) diagnostics.push(diag("error", "FLOW_FUNC_UNKNOWN", filePath, lineNumber, `Unknown function "${expr.name}".`));
      for (const arg of expr.args) scanExpression(arg, filePath, lineNumber, diagnostics, vars);
      return;
    }
    case "binary":
      scanExpression(expr.left, filePath, lineNumber, diagnostics, vars);
      scanExpression(expr.right, filePath, lineNumber, diagnostics, vars);
      return;
    case "unary":
      scanExpression(expr.argument, filePath, lineNumber, diagnostics, vars);
      return;
    case "index":
      scanExpression(expr.object, filePath, lineNumber, diagnostics, vars);
      scanExpression(expr.index, filePath, lineNumber, diagnostics, vars);
      return;
    default:
      return;
  }
}
function mergeScopes(base, scopes) {
  if (scopes.length === 0) return base;
  const merged = new Map(base);
  for (const [name, state] of base) {
    if (scopes.some((scope) => !scope.has(name))) merged.set(name, { ...state, defined: "maybe" });
  }
  return merged;
}
function mergeLoopScope(base, body) {
  const merged = new Map(base);
  for (const [name, state] of body) {
    if (!base.has(name)) merged.set(name, { ...state, defined: "maybe" });
  }
  return merged;
}
function diag(severity, code, filePath, lineNumber, message) {
  return { severity, code, filePath, lineNumber, message };
}
function range(min, max) {
  return min === max ? `${min}` : max === Infinity ? `at least ${min}` : `${min}-${max}`;
}
function stripTrailingRDelay(args) {
  const last = args[args.length - 1] ?? "";
  if (/^rdelay(?:\(\))?$/i.test(last) || /^rdelay\(\d+,\d+\)$/i.test(last)) return args.slice(0, -1);
  return args;
}

// src/donut/api-client.ts
init_errors();

// src/utils/logger.ts
var logger = {
  info(message) {
    process.stdout.write(`\x1B[36m${message}\x1B[0m
`);
  },
  error(message) {
    process.stderr.write(`\x1B[31m${message}\x1B[0m
`);
  }
};

// src/utils/retry.ts
init_errors();
function sleep(ms, signal) {
  if (signal?.aborted) return Promise.reject(new AppError("Aborted"));
  return new Promise((resolve7, reject) => {
    const onAbort = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      reject(new AppError("Aborted"));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve7();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

// src/donut/api-types.ts
var apiProfileSchema = external_exports.object({
  id: external_exports.string(),
  name: external_exports.string(),
  browser: external_exports.string(),
  version: external_exports.string().optional(),
  process_id: external_exports.number().nullable().optional(),
  is_running: external_exports.boolean().optional(),
  camoufox_config: external_exports.unknown().optional()
});
var apiProfilesResponseSchema = external_exports.object({
  profiles: external_exports.array(apiProfileSchema),
  total: external_exports.number()
});
var runProfileResponseSchema = external_exports.object({
  profile_id: external_exports.string(),
  name: external_exports.string().optional(),
  proxy: external_exports.string().nullable().optional(),
  remote_debugging_port: external_exports.number(),
  ws_url: external_exports.string().nullable().optional(),
  headless: external_exports.boolean()
});
function normalizeApiProfile(raw) {
  const parsed = apiProfileSchema.safeParse(raw);
  if (!parsed.success) return null;
  return {
    ...parsed.data,
    version: parsed.data.version ?? "unknown"
  };
}
function normalizeApiProfiles(raw) {
  const parsed = apiProfilesResponseSchema.safeParse(raw);
  if (!parsed.success) return [];
  return parsed.data.profiles.map((p) => ({
    ...p,
    version: p.version ?? "unknown"
  }));
}

// src/donut/api-client.ts
var DEFAULT_POLL_MS = 1e3;
var DEFAULT_TIMEOUT_MS = 3e4;
var DonutApiClient = class {
  constructor(baseUrl, token, signal) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.signal = signal;
  }
  baseUrl;
  token;
  signal;
  async listProfiles() {
    const data = await this.request("/v1/profiles", { method: "GET" });
    return normalizeApiProfiles(data);
  }
  async getProfile(profileId) {
    const data = await this.request(`/v1/profiles/${encodeURIComponent(profileId)}`, { method: "GET" });
    const raw = data && typeof data === "object" && "profile" in data ? data.profile : data;
    const profile = normalizeApiProfile(raw);
    if (!profile) {
      throw new AppError(`Failed to parse profile response for ${profileId}`);
    }
    return profile;
  }
  async runProfile(profileId, options) {
    const params = new URLSearchParams();
    if (options.url) params.set("url", options.url);
    params.set("headless", String(options.headless));
    const qs = params.toString();
    const data = await this.request(`/v1/profiles/${encodeURIComponent(profileId)}/run${qs ? `?${qs}` : ""}`, {
      method: "GET"
    });
    const parsed = runProfileResponseSchema.safeParse(data);
    if (!parsed.success) {
      throw new AppError(`Unexpected Donut API response: ${parsed.error.message}`);
    }
    return parsed.data;
  }
  async waitForProfileReady(profileId, options = {}) {
    const pollMs = options.pollIntervalMs ?? DEFAULT_POLL_MS;
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const deadline = Date.now() + timeoutMs;
    while (true) {
      this.throwIfAborted();
      const profile = await this.getProfile(profileId);
      if (profile.is_running === true && profile.process_id != null && profile.process_id > 0) {
        return profile;
      }
      if (Date.now() >= deadline) {
        throw new AppError(`Profile ${profileId} did not start within ${timeoutMs}ms. Last status: is_running=${profile.is_running}, process_id=${profile.process_id}`);
      }
      logger.info(`Waiting for profile ${profileId} to start... (is_running=${profile.is_running}, process_id=${profile.process_id})`);
      await sleep(pollMs, this.signal);
    }
  }
  async killProfile(profileId) {
    await this.request(`/v1/profiles/${encodeURIComponent(profileId)}/kill`, { method: "POST" });
  }
  throwIfAborted() {
    if (this.signal?.aborted) {
      throw new AppError("Aborted");
    }
  }
  async request(path2, init) {
    this.throwIfAborted();
    const headers = new Headers(init.headers);
    headers.set("accept", "application/json");
    if (init.body) headers.set("content-type", "application/json");
    if (this.token) headers.set("authorization", `Bearer ${this.token}`);
    let response;
    try {
      response = await fetch(`${this.baseUrl}${path2}`, { ...init, headers, signal: this.signal });
    } catch (error) {
      if (this.signal?.aborted) throw new AppError("Aborted");
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes("ECONNREFUSED") || msg.includes("connect")) {
        throw new AppError(`Cannot connect to Donut API at ${this.baseUrl}. Is Donut Browser running?`, error);
      }
      throw new AppError(`Donut API request failed: ${msg}`, error);
    }
    if (!response.ok) {
      throw new AppError(await this.httpErrorMessage(response));
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }
  async httpErrorMessage(response) {
    const details = await response.text().catch(() => "");
    const suffix = details ? ` Response: ${details}` : "";
    switch (response.status) {
      case 402:
        return `Donut automation entitlement missing (402).${suffix}`;
      case 403:
        return `Donut API forbidden (403). Accept terms or check API access/token.${suffix}`;
      case 404:
        return `Donut profile or endpoint not found (404).${suffix}`;
      case 500:
        return `Donut launch failed (500).${suffix}`;
      default:
        return `Donut API error ${response.status} ${response.statusText}.${suffix}`;
    }
  }
};

// src/donut/profile-selector.ts
init_errors();

// src/utils/abort.ts
var globalAbort = new AbortController();
var _cleaningUp = false;
function setCleaningUp(value) {
  _cleaningUp = value;
}
var _initialized = false;
function initAbortHandler() {
  if (_initialized) return;
  _initialized = true;
  process.on("SIGINT", () => {
    if (_cleaningUp) {
      process.exit(130);
    }
    _cleaningUp = true;
    globalAbort.abort();
  });
}

// src/donut/profile-selector.ts
function camoufoxProfiles(profiles) {
  return profiles.filter((profile) => profile.browser === "camoufox");
}
async function selectCamoufoxProfile(profiles, defaultProfileId) {
  if (process.stdin.isTTY) {
    process.stdin.resume();
  }
  const choices = camoufoxProfiles(profiles);
  if (choices.length === 0) {
    throw new AppError("No Camoufox profiles found. Create one in Donut Browser or check API at http://127.0.0.1:10108");
  }
  const selectChoices = [
    { label: "Back", value: "__back__" },
    ...choices.map((profile) => ({
      label: `${profile.is_running ? "[Running]" : "[Stopped]"} ${profile.name} (${profile.version ?? "?"})`,
      value: profile.id
    }))
  ];
  const ui = await getUi();
  const selectedVal = await ui.runListPicker({
    title: `Select Camoufox profile (${choices.length} found)`,
    options: selectChoices,
    initialValue: defaultProfileId ?? "__back__"
  });
  if (selectedVal === void 0 || selectedVal === "__back__") {
    throw globalAbort.signal.aborted ? new AppError("Aborted") : new CliBackError();
  }
  const selected = choices.find((profile) => profile.id === selectedVal);
  if (!selected) throw new AppError(`Selected profile not found: ${selectedVal}`);
  return selected;
}

// node_modules/.pnpm/ws@8.21.0/node_modules/ws/wrapper.mjs
var import_stream = __toESM(require_stream(), 1);
var import_extension = __toESM(require_extension(), 1);
var import_permessage_deflate = __toESM(require_permessage_deflate(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_subprotocol = __toESM(require_subprotocol(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);
var wrapper_default = import_websocket.default;

// src/bidi/bidi-client.ts
init_errors();

// src/bidi/commands.ts
function fromRemoteValue(value) {
  if (!value || typeof value !== "object") return value;
  switch (value.type) {
    case "undefined":
      return void 0;
    case "null":
      return null;
    case "string":
    case "number":
    case "boolean":
      return value.value;
    case "array":
      return Array.isArray(value.value) ? value.value.map((item) => fromRemoteValue(item)) : [];
    case "object":
      return objectFromRemoteValue(value.value);
    default:
      return value.value;
  }
}
function objectFromRemoteValue(raw) {
  const result = {};
  if (!Array.isArray(raw)) return result;
  for (const entry of raw) {
    if (!Array.isArray(entry) || entry.length !== 2) continue;
    const [key, entryValue] = entry;
    const name = typeof key === "string" ? key : String(fromRemoteValue(key));
    result[name] = fromRemoteValue(entryValue);
  }
  return result;
}

// src/bidi/bidi-client.ts
var BidiClient = class {
  constructor(connectTimeoutMs, commandTimeoutMs, signal) {
    this.connectTimeoutMs = connectTimeoutMs;
    this.commandTimeoutMs = commandTimeoutMs;
    this.signal = signal;
  }
  connectTimeoutMs;
  commandTimeoutMs;
  socket;
  nextId = 1;
  sessionId;
  pending = /* @__PURE__ */ new Map();
  signal;
  onAbort;
  connect(wsUrl) {
    return new Promise((resolve7, reject) => {
      const socket = new wrapper_default(wsUrl);
      const onAbort = () => {
        socket.terminate();
        reject(new AppError("Aborted"));
      };
      this.signal?.addEventListener("abort", onAbort, { once: true });
      const timer = setTimeout(() => {
        this.signal?.removeEventListener("abort", onAbort);
        socket.terminate();
        reject(new AppError(`Timed out connecting to BiDi WebSocket: ${wsUrl}`));
      }, this.connectTimeoutMs);
      socket.once("open", () => {
        this.signal?.removeEventListener("abort", onAbort);
        clearTimeout(timer);
        this.socket = socket;
        this.onAbort = () => this.rejectPending(new AppError("Aborted"));
        this.signal?.addEventListener("abort", this.onAbort, { once: true });
        resolve7();
      });
      socket.once("error", (error) => {
        this.signal?.removeEventListener("abort", onAbort);
        clearTimeout(timer);
        reject(new AppError(`Failed to connect BiDi WebSocket: ${wsUrl}`, error));
      });
      socket.on("message", (data) => this.handleMessage(data.toString()));
      socket.on("close", () => this.rejectPending(new AppError("BiDi WebSocket closed.")));
    });
  }
  async newSession() {
    const result = await this.command("session.new", { capabilities: {} }, false);
    this.sessionId = result.sessionId;
    return result.sessionId;
  }
  getTree() {
    return this.command("browsingContext.getTree", {});
  }
  async navigate(contextId, url) {
    await this.command("browsingContext.navigate", { context: contextId, url });
  }
  async createContext(referenceContext) {
    const result = await this.command("browsingContext.create", {
      type: "tab",
      ...referenceContext ? { referenceContext } : {}
    });
    return result.context;
  }
  async closeContext(contextId) {
    await this.command("browsingContext.close", { context: contextId });
  }
  async activateContext(contextId) {
    await this.command("browsingContext.activate", { context: contextId });
  }
  async evaluate(contextId, expression) {
    const result = await this.command("script.evaluate", {
      target: { context: contextId },
      expression,
      awaitPromise: true
    });
    return fromRemoteValue(result.result);
  }
  async evaluateSharedReference(contextId, expression) {
    const result = await this.command("script.evaluate", {
      target: { context: contextId },
      expression,
      awaitPromise: true,
      resultOwnership: "root"
    });
    const sharedId = result.result.sharedId;
    if (!sharedId) throw new AppError("BiDi script evaluation did not return a shared reference.");
    return { sharedId };
  }
  async setFiles(contextId, element, files) {
    await this.command("input.setFiles", { context: contextId, element, files });
  }
  async performActions(contextId, actions) {
    await this.command("input.performActions", { context: contextId, actions });
  }
  async releaseActions(contextId) {
    await this.command("input.releaseActions", { context: contextId });
  }
  async close() {
    if (this.onAbort) {
      this.signal?.removeEventListener("abort", this.onAbort);
      this.onAbort = void 0;
    }
    if (!this.socket) return;
    await new Promise((resolve7) => {
      const socket = this.socket;
      if (!socket || socket.readyState === wrapper_default.CLOSED) return resolve7();
      socket.once("close", () => resolve7());
      socket.close();
      setTimeout(resolve7, 1e3);
    });
  }
  command(method, params, includeSessionId = true) {
    if (this.signal?.aborted) {
      return Promise.reject(new AppError("Aborted"));
    }
    const socket = this.socket;
    if (!socket || socket.readyState !== wrapper_default.OPEN) {
      return Promise.reject(new AppError("BiDi WebSocket is not connected."));
    }
    const id = this.nextId++;
    const envelope = { id, method, params };
    if (includeSessionId && this.sessionId) envelope.sessionId = this.sessionId;
    return new Promise((resolve7, reject) => {
      const onAbort = () => {
        this.pending.delete(id);
        clearTimeout(timer);
        reject(new AppError("Aborted"));
      };
      this.signal?.addEventListener("abort", onAbort, { once: true });
      const timer = setTimeout(() => {
        this.signal?.removeEventListener("abort", onAbort);
        this.pending.delete(id);
        reject(new AppError(`BiDi command timed out: ${method}`));
      }, this.commandTimeoutMs);
      this.pending.set(id, {
        resolve: (value) => {
          this.signal?.removeEventListener("abort", onAbort);
          clearTimeout(timer);
          resolve7(value);
        },
        reject: (error) => {
          this.signal?.removeEventListener("abort", onAbort);
          clearTimeout(timer);
          reject(error);
        },
        timer
      });
      socket.send(JSON.stringify(envelope), (error) => {
        if (!error) return;
        this.signal?.removeEventListener("abort", onAbort);
        clearTimeout(timer);
        this.pending.delete(id);
        reject(new AppError(`Failed to send BiDi command: ${method}`, error));
      });
    });
  }
  handleMessage(message) {
    let parsed;
    try {
      parsed = JSON.parse(message);
    } catch {
      return;
    }
    if (!("id" in parsed)) return;
    const pending = this.pending.get(parsed.id);
    if (!pending) return;
    clearTimeout(pending.timer);
    this.pending.delete(parsed.id);
    if (parsed.type === "success") {
      pending.resolve(parsed.result);
      return;
    }
    pending.reject(new AppError(`BiDi error: ${parsed.error}${parsed.message ? ` - ${parsed.message}` : ""}`));
  }
  rejectPending(error) {
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timer);
      pending.reject(error);
      this.pending.delete(id);
    }
  }
};

// src/runtime/page-automation.ts
import { stat as stat2 } from "fs/promises";
import { resolve as resolve2 } from "path";

// src/automation/interactive-elements.ts
var countInteractiveElementsExpression = `(() => {
  const selectors = ['a','button','input','textarea','select','[role=button]','[role=link]','[tabindex]:not([tabindex="-1"])'];
  const elements = Array.from(document.querySelectorAll(selectors.join(',')));
  const visible = elements.filter((el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
  });
  return {
    total: elements.length,
    visible: visible.length,
    byTag: visible.reduce((acc, el) => {
      const key = el.tagName.toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
    buttons: visible.map((el) => ({
      tag: el.tagName.toLowerCase(),
      text: (el.textContent || '').trim().substring(0, 120),
      ariaLabel: el.getAttribute('aria-label') || '',
      role: el.getAttribute('role') || '',
      type: el.getAttribute('type') || '',
      href: el.getAttribute('href') || '',
      classes: el.className || '',
    })),
  };
})()`;

// src/runtime/clipboard-lock.ts
var tail = Promise.resolve();
async function runWithClipboardLock(fn) {
  const run = tail.then(fn, fn);
  tail = run.then(
    () => void 0,
    () => void 0
  );
  return run;
}

// src/runtime/host-clipboard.ts
init_errors();
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile as writeFile2 } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join as join2 } from "node:path";
async function writeHostClipboardText(text) {
  if (process.platform !== "win32") {
    throw new AppError(`Host clipboard pasteText is not supported on ${process.platform}.`);
  }
  const dir = await mkdtemp(join2(tmpdir(), "donumate-clipboard-"));
  const filePath = join2(dir, "clipboard.txt");
  try {
    await writeFile2(filePath, text, "utf16le");
    await runPowerShellClipboardWrite(filePath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
function runPowerShellClipboardWrite(filePath) {
  return new Promise((resolve7, reject) => {
    const child = spawn("powershell.exe", [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "Set-Clipboard -Value ([System.IO.File]::ReadAllText($env:DONUMATE_CLIPBOARD_FILE, [System.Text.Encoding]::Unicode))"
    ], {
      env: { ...process.env, DONUMATE_CLIPBOARD_FILE: filePath },
      stdio: ["ignore", "ignore", "pipe"],
      windowsHide: true
    });
    let stderr = "";
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.once("error", (error) => {
      reject(new AppError("Failed to start PowerShell for clipboard write.", error));
    });
    child.once("close", (code) => {
      if (code === 0) {
        resolve7();
        return;
      }
      reject(new AppError(`Failed to write clipboard with PowerShell.${stderr.trim() ? ` ${stderr.trim()}` : ""}`));
    });
  });
}

// src/runtime/page-automation.ts
var waitForLoadExpression = `(() => {
  return new Promise((resolve) => {
    const check = () => {
      if (document.readyState === 'complete') {
        resolve(true);
        return;
      }
      setTimeout(check, 200);
    };
    check();
  });
})()`;
var getPageInfoExpression = `JSON.stringify({ title: document.title, url: location.href })`;
var VIRTUAL_MOUSE_ID = "donut-virtual-mouse";
var VIRTUAL_KEYBOARD_ID = "donut-virtual-keyboard";
var VIRTUAL_MOUSE_CURSOR_ID = "__donut_virtual_mouse_cursor__";
var CONTROL_KEY = "\uE009";
var KEY_CODES = {
  null: "\uE000",
  cancel: "\uE001",
  help: "\uE002",
  backspace: "\uE003",
  tab: "\uE004",
  clear: "\uE005",
  return: "\uE006",
  enter: "\uE007",
  shift: "\uE008",
  control: "\uE009",
  alt: "\uE00A",
  pause: "\uE00B",
  escape: "\uE00C",
  space: "\uE00D",
  pageup: "\uE00E",
  pagedown: "\uE00F",
  end: "\uE010",
  home: "\uE011",
  arrowleft: "\uE012",
  arrowup: "\uE013",
  arrowright: "\uE014",
  arrowdown: "\uE015",
  insert: "\uE016",
  delete: "\uE017",
  semicolon: "\uE018",
  equals: "\uE019",
  numpad0: "\uE01A",
  numpad1: "\uE01B",
  numpad2: "\uE01C",
  numpad3: "\uE01D",
  numpad4: "\uE01E",
  numpad5: "\uE01F",
  numpad6: "\uE020",
  numpad7: "\uE021",
  numpad8: "\uE022",
  numpad9: "\uE023",
  multiply: "\uE024",
  add: "\uE025",
  separator: "\uE026",
  subtract: "\uE027",
  decimal: "\uE028",
  divide: "\uE029",
  f1: "\uE031",
  f2: "\uE032",
  f3: "\uE033",
  f4: "\uE034",
  f5: "\uE035",
  f6: "\uE036",
  f7: "\uE037",
  f8: "\uE038",
  f9: "\uE039",
  f10: "\uE03A",
  f11: "\uE03B",
  f12: "\uE03C",
  meta: "\uE03D",
  command: "\uE03D",
  capslock: "\uE03E",
  numlock: "\uE03F",
  scrolllock: "\uE040"
};
var DEFAULT_TYPING_MIN_DELAY_MS = 35;
var DEFAULT_TYPING_MAX_DELAY_MS = 140;
var PageAutomation = class {
  constructor(bidi) {
    this.bidi = bidi;
  }
  bidi;
  contextId;
  mousePosition;
  /** Initialize BiDi session and get default browsing context */
  async init() {
    await this.bidi.newSession();
    const tree = await this.bidi.getTree();
    this.contextId = tree.contexts[0]?.context;
    if (!this.contextId) {
      throw new Error("No browsing context returned by BiDi.");
    }
  }
  /** Navigate to URL */
  async goto(url) {
    if (!this.contextId) throw new Error("Page not initialized. Call init() first.");
    await this.bidi.navigate(this.contextId, url);
  }
  async navUrl(url) {
    await this.goto(url);
  }
  async newTab(url) {
    const current = this.contextId;
    const contextId = await this.bidi.createContext(current);
    this.contextId = contextId;
    this.mousePosition = void 0;
    if (url) await this.goto(url);
  }
  async closeTab() {
    if (!this.contextId) throw new Error("Page not initialized. Call init() first.");
    const closing = this.contextId;
    await this.bidi.closeContext(closing);
    const tree = await this.bidi.getTree();
    this.contextId = tree.contexts.find((item) => item.context !== closing)?.context;
    this.mousePosition = void 0;
    if (!this.contextId) throw new Error("No browsing context remains after closing tab.");
  }
  async activeTab(target) {
    const tree = await this.bidi.getTree();
    const contexts = flattenContexts(tree.contexts);
    const index = Number(target);
    const contextId = Number.isInteger(index) ? contexts[index]?.context : contexts.find((item) => item.context === target)?.context;
    if (!contextId) throw new Error(`Tab not found: ${target}`);
    await this.bidi.activateContext(contextId);
    this.contextId = contextId;
    this.mousePosition = void 0;
  }
  /** Wait for document.readyState === 'complete' */
  async waitForLoad() {
    if (!this.contextId) throw new Error("Page not initialized. Call init() first.");
    await this.bidi.evaluate(this.contextId, waitForLoadExpression);
  }
  /** Delay N milliseconds */
  async delay(ms) {
    await sleep(ms);
  }
  /** Execute arbitrary JS expression in page context */
  async evaluate(expression) {
    if (!this.contextId) throw new Error("Page not initialized. Call init() first.");
    return this.bidi.evaluate(this.contextId, expression);
  }
  /** Get page title and URL */
  async info() {
    const str = String(await this.evaluate(getPageInfoExpression));
    return JSON.parse(str);
  }
  async getUrl() {
    return String(await this.evaluate("location.href"));
  }
  async waitUrlChange(previousUrl, timeoutMs = 1e4) {
    const changedUrl = await this.evaluate(`(() => {
      const previousUrl = ${JSON.stringify(previousUrl)};
      const timeoutMs = ${JSON.stringify(timeoutMs)};
      return new Promise((resolve) => {
        const deadline = Date.now() + timeoutMs;
        const check = () => {
          if (location.href !== previousUrl) return resolve(location.href);
          if (Date.now() >= deadline) return resolve(null);
          setTimeout(check, 200);
        };
        check();
      });
    })()`);
    if (changedUrl === null) throw new Error(`Timed out waiting for URL to change from: ${previousUrl}`);
    return changedUrl;
  }
  async backNav(timeoutMs = 1e4) {
    const previousUrl = await this.getUrl();
    await this.evaluate("history.back()");
    await this.waitUrlChange(previousUrl, timeoutMs);
  }
  async reloadNav() {
    await this.evaluate("location.reload()");
    await this.waitForLoad();
  }
  /** Check whether an XPath matches at least one element */
  async existsXPath(xpath) {
    return Boolean(await this.evaluate(`(() => {
      const xpath = ${JSON.stringify(xpath)};
      return Boolean(document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue);
    })()`));
  }
  /** Wait until an XPath matches at least one element */
  async waitForXPath(xpath, timeoutMs = 1e4) {
    const found = await this.evaluate(`(() => {
      const xpath = ${JSON.stringify(xpath)};
      const timeoutMs = ${JSON.stringify(timeoutMs)};
      return new Promise((resolve) => {
        const deadline = Date.now() + timeoutMs;
        const check = () => {
          const node = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          if (node) return resolve(true);
          if (Date.now() >= deadline) return resolve(false);
          setTimeout(check, 200);
        };
        check();
      });
    })()`);
    if (!found) throw new Error(`Timed out waiting for XPath: ${xpath}`);
  }
  /** Click first element matching XPath */
  async clickXPath(xpath) {
    const target = await this.resolveXPathTarget(xpath, "clickable");
    await this.moveMouseTo(target);
    await this.clickCurrentMousePosition(target);
    this.mousePosition = { x: target.x, y: target.y };
  }
  /** Type text into first input-like element matching XPath using BiDi key actions */
  async typeTextXPath(xpath, text, options = {}) {
    if (!this.contextId) throw new Error("Page not initialized. Call init() first.");
    await this.clickAndFocusXPath(xpath, "typeable");
    try {
      await this.bidi.performActions(this.contextId, [
        {
          type: "key",
          id: VIRTUAL_KEYBOARD_ID,
          actions: this.buildHumanTypingActions(text, options)
        }
      ]);
    } finally {
      await this.bidi.releaseActions(this.contextId);
    }
  }
  /** Paste text into first input-like element matching XPath using host clipboard and Ctrl+V */
  async pasteTextXPath(xpath, text) {
    if (!this.contextId) throw new Error("Page not initialized. Call init() first.");
    await runWithClipboardLock(async () => {
      if (!this.contextId) throw new Error("Page not initialized. Call init() first.");
      await writeHostClipboardText(text);
      await this.clickAndFocusXPath(xpath, "typeable");
      try {
        await this.bidi.performActions(this.contextId, [
          {
            type: "key",
            id: VIRTUAL_KEYBOARD_ID,
            actions: [
              { type: "keyDown", value: CONTROL_KEY },
              { type: "keyDown", value: "v" },
              { type: "keyUp", value: "v" },
              { type: "keyUp", value: CONTROL_KEY }
            ]
          }
        ]);
      } finally {
        await this.bidi.releaseActions(this.contextId);
      }
    });
  }
  /** Backward-compatible alias for legacy TS scripts and .flow type command */
  async typeXPath(xpath, text) {
    await this.typeTextXPath(xpath, text);
  }
  /** Read text from first element matching XPath */
  async textXPath(xpath) {
    const text = await this.evaluate(`(() => {
      const xpath = ${JSON.stringify(xpath)};
      const node = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      return node ? (node.textContent ?? '') : null;
    })()`);
    if (text === null) throw new Error(`XPath not found: ${xpath}`);
    return text;
  }
  async getElementText(xpath) {
    return this.textXPath(xpath);
  }
  async getElementAttribute(xpath, attribute) {
    const value = await this.evaluate(`(() => {
      const xpath = ${JSON.stringify(xpath)};
      const attribute = ${JSON.stringify(attribute)};
      const node = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (!(node instanceof Element)) return null;
      return node.getAttribute(attribute) ?? '';
    })()`);
    if (value === null) throw new Error(`XPath not found: ${xpath}`);
    return value;
  }
  async countElement(xpath) {
    return Number(await this.evaluate(`(() => {
      const xpath = ${JSON.stringify(xpath)};
      return document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength;
    })()`));
  }
  async moveMouseXPath(xpath) {
    const target = await this.resolveXPathTarget(xpath, "movable");
    await this.moveMouseTo(target);
    this.mousePosition = { x: target.x, y: target.y };
  }
  async scroll(px) {
    await this.evaluate(`window.scrollBy(0, ${JSON.stringify(px)})`);
  }
  async executeJs(script) {
    return this.evaluate(script);
  }
  async fileUpload(filePath, xpath) {
    if (!this.contextId) throw new Error("Page not initialized. Call init() first.");
    const absolutePath = resolve2(filePath);
    const file = await stat2(absolutePath);
    if (!file.isFile()) throw new Error(`Upload path is not a file: ${absolutePath}`);
    const element = await this.bidi.evaluateSharedReference(this.contextId, `(() => {
      const xpath = ${JSON.stringify(xpath)};
      const node = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (!(node instanceof HTMLInputElement) || node.type !== 'file') throw new Error('XPath must point to input[type=file].');
      return node;
    })()`);
    await this.bidi.setFiles(this.contextId, element, [absolutePath]);
  }
  /** Count all interactive elements (a, button, input, etc.) */
  async countInteractiveElements() {
    return this.evaluate(countInteractiveElementsExpression);
  }
  /** Get only button/link elements with details */
  async getButtons() {
    const result = await this.countInteractiveElements();
    return result.buttons;
  }
  async clickAndFocusXPath(xpath, actionName) {
    const target = await this.resolveXPathTarget(xpath, actionName);
    await this.moveMouseTo(target);
    await this.clickCurrentMousePosition(target);
    this.mousePosition = { x: target.x, y: target.y };
    const focused = await this.evaluate(`(() => {
      const xpath = ${JSON.stringify(xpath)};
      const node = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (!(node instanceof HTMLElement)) return false;
      node.focus();
      return document.activeElement === node || node.contains(document.activeElement);
    })()`);
    if (!focused) throw new Error(`XPath not found or not ${actionName}: ${xpath}`);
  }
  buildHumanTypingActions(text, options) {
    const minDelayMs = options.minDelayMs ?? DEFAULT_TYPING_MIN_DELAY_MS;
    const maxDelayMs = options.maxDelayMs ?? DEFAULT_TYPING_MAX_DELAY_MS;
    const lowerDelayMs = Math.max(0, Math.min(minDelayMs, maxDelayMs));
    const upperDelayMs = Math.max(lowerDelayMs, Math.max(minDelayMs, maxDelayMs));
    const actions = [];
    for (const chunk of splitGraphemes(text)) {
      actions.push({ type: "keyDown", value: chunk });
      actions.push({ type: "keyUp", value: chunk });
      actions.push({ type: "pause", duration: this.typingDelay(chunk, lowerDelayMs, upperDelayMs) });
    }
    return actions;
  }
  typingDelay(chunk, minDelayMs, maxDelayMs) {
    const base = minDelayMs === maxDelayMs ? minDelayMs : this.randomInt(minDelayMs, maxDelayMs);
    if (/\s/.test(chunk)) return base + this.randomInt(20, 90);
    if (/[.,!?;:]$/.test(chunk)) return base + this.randomInt(80, 180);
    return base;
  }
  async resolveXPathTarget(xpath, actionName) {
    const raw = await this.evaluate(`(() => {
      const xpath = ${JSON.stringify(xpath)};
      const node = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (!(node instanceof Element)) return JSON.stringify({ ok: false, reason: 'XPath did not match an element.' });

      node.scrollIntoView({ block: 'center', inline: 'center' });
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const visible = rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0';
      if (!visible) return JSON.stringify({ ok: false, reason: 'Element is not visible.' });

      const marginX = Math.min(Math.max(rect.width * 0.2, 1), 12);
      const marginY = Math.min(Math.max(rect.height * 0.2, 1), 12);
      const jitterX = rect.width > 8 ? (Math.random() * 2 - 1) * Math.max(0, rect.width / 2 - marginX) * 0.45 : 0;
      const jitterY = rect.height > 8 ? (Math.random() * 2 - 1) * Math.max(0, rect.height / 2 - marginY) * 0.45 : 0;
      const x = Math.min(Math.max(rect.left + rect.width / 2 + jitterX, 0), Math.max(0, viewport.width - 1));
      const y = Math.min(Math.max(rect.top + rect.height / 2 + jitterY, 0), Math.max(0, viewport.height - 1));
      return JSON.stringify({ ok: true, x, y, viewport });
    })()`);
    const result = JSON.parse(String(raw));
    if (!result.ok) throw new Error(`XPath not found or not ${actionName}: ${xpath}. ${result.reason}`);
    return { x: result.x, y: result.y, viewport: result.viewport };
  }
  async moveMouseTo(target) {
    if (!this.contextId) throw new Error("Page not initialized. Call init() first.");
    await this.ensureVirtualCursor();
    const start = this.clampPoint(this.mousePosition ?? this.randomStartPoint(target), target.viewport);
    const path2 = this.generateMousePath(start, target, target.viewport);
    await this.showVirtualCursor(start, 0);
    for (const point of path2) {
      await this.showVirtualCursor(point, point.duration);
      await this.bidi.performActions(this.contextId, [
        {
          type: "pointer",
          id: VIRTUAL_MOUSE_ID,
          parameters: { pointerType: "mouse" },
          actions: [this.toPointerMove(point)]
        }
      ]);
    }
    this.mousePosition = { x: target.x, y: target.y };
    await this.showVirtualCursor(target, 0);
  }
  async clickCurrentMousePosition(point) {
    if (!this.contextId) throw new Error("Page not initialized. Call init() first.");
    await this.bidi.performActions(this.contextId, [
      {
        type: "pointer",
        id: VIRTUAL_MOUSE_ID,
        parameters: { pointerType: "mouse" },
        actions: [
          { type: "pointerMove", x: Math.round(point.x), y: Math.round(point.y), duration: 0, origin: "viewport" },
          { type: "pointerDown", button: 0 },
          { type: "pause", duration: this.randomInt(35, 95) },
          { type: "pointerUp", button: 0 }
        ]
      }
    ]);
    await this.bidi.releaseActions(this.contextId);
  }
  generateMousePath(start, target, viewport) {
    const distance = Math.hypot(target.x - start.x, target.y - start.y);
    if (distance < 1) return [{ ...target, duration: this.randomInt(20, 45) }];
    const duration = this.randomInt(Math.min(900, Math.max(220, Math.round(distance * 0.7))), Math.min(1300, Math.max(360, Math.round(distance * 1.2))));
    const steps = Math.max(10, Math.min(48, Math.ceil(distance / this.randomFloat(14, 24))));
    const dx = target.x - start.x;
    const dy = target.y - start.y;
    const nx = -dy / distance;
    const ny = dx / distance;
    const curve = this.randomFloat(-0.35, 0.35) * Math.min(220, distance * 0.45);
    const p1 = {
      x: start.x + dx * this.randomFloat(0.2, 0.38) + nx * curve,
      y: start.y + dy * this.randomFloat(0.2, 0.38) + ny * curve
    };
    const p2 = {
      x: start.x + dx * this.randomFloat(0.62, 0.82) - nx * curve * this.randomFloat(0.45, 0.9),
      y: start.y + dy * this.randomFloat(0.62, 0.82) - ny * curve * this.randomFloat(0.45, 0.9)
    };
    const points = [];
    const useOvershoot = distance > 120 && Math.random() < 0.25;
    const finalTarget = useOvershoot ? this.overshootPoint(start, target, viewport) : target;
    for (let i = 1; i <= steps; i += 1) {
      const t = i / steps;
      const eased = easeInOutCubic(t);
      const base = cubicBezier(start, p1, p2, finalTarget, eased);
      const jitterScale = Math.sin(Math.PI * t) * Math.min(5, distance * 0.015);
      const jittered = this.clampPoint({
        x: base.x + this.randomFloat(-jitterScale, jitterScale),
        y: base.y + this.randomFloat(-jitterScale, jitterScale)
      }, viewport);
      points.push({ ...jittered, duration: Math.max(5, Math.round(duration / steps + this.randomFloat(-4, 8))) });
    }
    if (useOvershoot) {
      const settleSteps = this.randomInt(3, 6);
      const overshot = points[points.length - 1] ?? finalTarget;
      for (let i = 1; i <= settleSteps; i += 1) {
        const t = easeOutQuad(i / settleSteps);
        points.push({
          x: overshot.x + (target.x - overshot.x) * t,
          y: overshot.y + (target.y - overshot.y) * t,
          duration: this.randomInt(18, 42)
        });
      }
    }
    points.push({ x: target.x, y: target.y, duration: this.randomInt(10, 25) });
    return points;
  }
  async ensureVirtualCursor() {
    await this.evaluate(`(() => {
      let cursor = document.getElementById(${JSON.stringify(VIRTUAL_MOUSE_CURSOR_ID)});
      if (cursor) return;
      cursor = document.createElement('div');
      cursor.id = ${JSON.stringify(VIRTUAL_MOUSE_CURSOR_ID)};
      cursor.style.position = 'fixed';
      cursor.style.left = '0px';
      cursor.style.top = '0px';
      cursor.style.width = '9px';
      cursor.style.height = '9px';
      cursor.style.marginLeft = '-4.5px';
      cursor.style.marginTop = '-4.5px';
      cursor.style.borderRadius = '999px';
      cursor.style.background = '#ff1f1f';
      cursor.style.border = '1px solid rgba(255,255,255,0.95)';
      cursor.style.boxShadow = '0 0 0 2px rgba(255,31,31,0.25), 0 1px 5px rgba(0,0,0,0.35)';
      cursor.style.pointerEvents = 'none';
      cursor.style.zIndex = '2147483647';
      cursor.style.transform = 'translate3d(-100px, -100px, 0)';
      cursor.style.transition = 'none';
      document.documentElement.appendChild(cursor);
    })()`);
  }
  async showVirtualCursor(point, duration = 0) {
    await this.evaluate(`(() => {
      const cursor = document.getElementById(${JSON.stringify(VIRTUAL_MOUSE_CURSOR_ID)});
      if (!cursor) return;
      cursor.style.transition = ${JSON.stringify(`transform ${Math.max(0, Math.round(duration))}ms linear`)};
      cursor.style.transform = ${JSON.stringify(`translate3d(${Math.round(point.x)}px, ${Math.round(point.y)}px, 0)`)};
    })()`);
  }
  toPointerMove(point) {
    return {
      type: "pointerMove",
      x: Math.round(point.x),
      y: Math.round(point.y),
      duration: point.duration,
      origin: "viewport"
    };
  }
  randomStartPoint(target) {
    const nearTarget = Math.random() < 0.35;
    if (nearTarget) {
      return this.clampPoint({
        x: target.x + this.randomFloat(-180, 180),
        y: target.y + this.randomFloat(-140, 140)
      }, target.viewport);
    }
    return {
      x: this.randomFloat(target.viewport.width * 0.25, target.viewport.width * 0.75),
      y: this.randomFloat(target.viewport.height * 0.25, target.viewport.height * 0.75)
    };
  }
  overshootPoint(start, target, viewport) {
    const distance = Math.hypot(target.x - start.x, target.y - start.y);
    if (distance < 1) return target;
    const amount = this.randomFloat(3, 12);
    return this.clampPoint({
      x: target.x + (target.x - start.x) / distance * amount + this.randomFloat(-3, 3),
      y: target.y + (target.y - start.y) / distance * amount + this.randomFloat(-3, 3)
    }, viewport);
  }
  clampPoint(point, viewport) {
    return {
      x: Math.min(Math.max(point.x, 0), Math.max(0, viewport.width - 1)),
      y: Math.min(Math.max(point.y, 0), Math.max(0, viewport.height - 1))
    };
  }
  randomFloat(min, max) {
    return min + Math.random() * (max - min);
  }
  async sendKey(...keys) {
    if (!this.contextId) throw new Error("Page not initialized. Call init() first.");
    const mapped = keys.map((k) => KEY_CODES[k.toLowerCase()] ?? k);
    const actions = [];
    for (const code of mapped) actions.push({ type: "keyDown", value: code });
    for (let i = mapped.length - 1; i >= 0; i--) actions.push({ type: "keyUp", value: mapped[i] ?? "" });
    try {
      await this.bidi.performActions(this.contextId, [{ type: "key", id: VIRTUAL_KEYBOARD_ID, actions }]);
    } finally {
      await this.bidi.releaseActions(this.contextId);
    }
  }
  randomInt(min, max) {
    return Math.floor(this.randomFloat(min, max + 1));
  }
};
function flattenContexts(contexts) {
  const result = [];
  for (const context of contexts) {
    result.push(context);
    if (context.children?.length) result.push(...flattenContexts(context.children));
  }
  return result;
}
function cubicBezier(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return {
    x: mt ** 3 * p0.x + 3 * mt ** 2 * t * p1.x + 3 * mt * t ** 2 * p2.x + t ** 3 * p3.x,
    y: mt ** 3 * p0.y + 3 * mt ** 2 * t * p1.y + 3 * mt * t ** 2 * p2.y + t ** 3 * p3.y
  };
}
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}
function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}
function splitGraphemes(text) {
  const segmenter = typeof Intl.Segmenter === "function" ? new Intl.Segmenter(void 0, { granularity: "grapheme" }) : void 0;
  if (!segmenter) return Array.from(text);
  return Array.from(segmenter.segment(text), (item) => item.segment);
}

// src/runtime/script-loader.ts
init_errors();
import { readdir as readdir2, readFile as readFile2, writeFile as writeFile4, mkdir as mkdir3, rm as rm2 } from "fs/promises";
import { tmpdir as tmpdir2 } from "os";
import { resolve as resolve4, isAbsolute as isAbsolute2, join as join3, relative as relative2, sep as sep2 } from "path";
import { pathToFileURL } from "url";
import { randomBytes } from "crypto";

// src/utils/runtime-mode.ts
function isPackagedExecutable() {
  const execPath = process.execPath.toLowerCase();
  if (process.platform === "win32") {
    return execPath.endsWith(".exe") && !execPath.endsWith("node.exe");
  }
  return !execPath.endsWith("/node") && !execPath.endsWith("node");
}

// src/runtime/dsl/executor.ts
init_errors();
init_catalog();
init_runtime_spec();
init_parser();
import { request as httpRequest } from "http";
import { request as httpsRequest } from "https";
import { appendFile, mkdir as mkdir2, readFile, readdir, stat as stat3, writeFile as writeFile3 } from "fs/promises";
import { dirname, resolve as resolve3 } from "path";
import XLSX from "xlsx";
var DEFAULT_WAIT_TIMEOUT_MS = 1e4;
var MAX_LOOP_ITERATIONS = 1e4;
var RDELAY_MIN_MS = 1e3;
var RDELAY_MAX_MS = 3e3;
async function loadFlowProgram(filePath) {
  const source = await readFile(filePath, "utf8");
  return parseFlowProgram(source);
}
async function executeFlowBlock(ctx, program3, block) {
  const statements = program3[block];
  validateStatementsForBlock(statements, block);
  const excelInputs = new Set(program3.inputs.filter((input) => input.type === "inputExcelFile").map((input) => input.name.toLowerCase()));
  const signal = await executeFlowStatements(ctx, statements, { locals: {}, loopIndexStack: [], excelInputs });
  if (signal === "stop") return;
  if (signal) throw new AppError(`${signal === "next" ? "nextLoop" : "exitLoop"} used outside a loop.`);
}
async function executeFlowStatements(ctx, statements, runtime) {
  for (const statement of statements) {
    if (statement.type === "command") {
      const interpolated = await interpolateCommand(ctx, statement, runtime);
      ctx.log(`flow:${statement.lineNumber}`, formatFlowCommand(interpolated));
      const sig = await executeFlowCommand(ctx, interpolated, runtime);
      if (sig) return sig;
      continue;
    }
    ctx.log(`flow:${statement.lineNumber}`, statement.raw.trim());
    const signal = await executeFlowStatement(ctx, statement, runtime);
    if (signal) return signal;
  }
  return void 0;
}
async function executeFlowStatement(ctx, statement, runtime) {
  switch (statement.type) {
    case "command":
      return executeFlowCommand(ctx, await interpolateCommand(ctx, statement, runtime), runtime);
    case "assignment":
      runtime.locals[statement.name] = await evaluateExpression(ctx, statement.value, runtime, statement);
      ctx.log(`${statement.name} = ${flowValueToString(runtime.locals[statement.name] ?? null)}`);
      return void 0;
    case "loopControl":
      if (runtime.loopIndexStack.length === 0) throw lineError(statement, `${statement.control === "next" ? "nextLoop" : "exitLoop"} can only be used inside a loop.`);
      return statement.control;
    case "if":
      for (const branch of statement.branches) {
        if (isTruthy(await evaluateExpression(ctx, branch.condition, runtime, statement))) {
          return executeFlowStatements(ctx, branch.body, runtime);
        }
      }
      if (statement.elseBody) return executeFlowStatements(ctx, statement.elseBody, runtime);
      return void 0;
    case "while": {
      let iterations = 0;
      while (isTruthy(await evaluateExpression(ctx, statement.condition, runtime, statement))) {
        if (iterations >= MAX_LOOP_ITERATIONS) throw lineError(statement, `while exceeded ${MAX_LOOP_ITERATIONS} iterations.`);
        runtime.loopIndexStack.push(iterations);
        let signal;
        try {
          signal = await executeFlowStatements(ctx, statement.body, runtime);
        } finally {
          runtime.loopIndexStack.pop();
        }
        iterations += 1;
        if (signal === "exit") return void 0;
        if (signal === "next") continue;
        if (signal === "stop") return "stop";
      }
      return void 0;
    }
    case "for": {
      await executeFlowStatement(ctx, statement.init, runtime);
      let iterations = 0;
      while (isTruthy(await evaluateExpression(ctx, statement.condition, runtime, statement))) {
        if (iterations >= MAX_LOOP_ITERATIONS) throw lineError(statement, `for exceeded ${MAX_LOOP_ITERATIONS} iterations.`);
        runtime.loopIndexStack.push(iterations);
        let signal;
        try {
          signal = await executeFlowStatements(ctx, statement.body, runtime);
        } finally {
          runtime.loopIndexStack.pop();
        }
        if (signal === "exit") return void 0;
        if (signal === "stop") return "stop";
        await executeFlowStatement(ctx, statement.update, runtime);
        iterations += 1;
        if (signal === "next") continue;
      }
      return void 0;
    }
  }
}
async function executeFlowCommand(ctx, item, runtime) {
  const commandName = normalizeFlowCommandName(item.command).toLowerCase();
  if (commandName === "exit") {
    const [message] = requireArgs(item, 0, 1);
    if (message) ctx.log(message);
    return "stop";
  }
  let hasRDelay = false;
  let rDelayMin = RDELAY_MIN_MS;
  let rDelayMax = RDELAY_MAX_MS;
  const args = [...item.args];
  if (args.length > 0) {
    const lastArg = args[args.length - 1] ?? "";
    const match = lastArg.match(/^rdelay\((\d+),(\d+)\)$/i);
    if (match) {
      hasRDelay = true;
      rDelayMin = parseInt(match[1], 10);
      rDelayMax = parseInt(match[2], 10);
      args.pop();
    } else if (/^rdelay(?:\(\))?$/i.test(lastArg)) {
      hasRDelay = true;
      args.pop();
    }
  }
  const cmd = { ...item, args };
  const runCmd = async () => {
    const command = cmd.command.toLowerCase();
    switch (command) {
      case "goto":
      case "nav":
      case "navurl": {
        const [url] = requireArgs(cmd, 1);
        await requirePage(ctx, cmd).goto(url);
        return;
      }
      case "newtab": {
        const [url] = requireArgs(cmd, 0, 1);
        await requirePage(ctx, cmd).newTab(url);
        return;
      }
      case "closetab": {
        requireArgs(cmd, 0);
        await requirePage(ctx, cmd).closeTab();
        return;
      }
      case "activetab": {
        const [target] = requireArgs(cmd, 1);
        await requirePage(ctx, cmd).activeTab(target);
        return;
      }
      case "backnav": {
        const [timeout] = requireArgs(cmd, 0, 1);
        await requirePage(ctx, cmd).backNav(parseOptionalNumber(timeout, DEFAULT_WAIT_TIMEOUT_MS, cmd));
        return;
      }
      case "reloadnav": {
        requireArgs(cmd, 0);
        await requirePage(ctx, cmd).reloadNav();
        return;
      }
      case "geturl": {
        requireArgs(cmd, 0);
        runtime.locals.pageUrl = await requirePage(ctx, cmd).getUrl();
        return;
      }
      case "waiturlchange": {
        const [url, timeout] = requireArgs(cmd, 1, 2);
        runtime.locals.pageUrl = await requirePage(ctx, cmd).waitUrlChange(url, parseOptionalNumber(timeout, DEFAULT_WAIT_TIMEOUT_MS, cmd));
        ctx.log(`pageUrl=${runtime.locals.pageUrl}`);
        return;
      }
      case "waitload": {
        const [settleMs] = requireArgs(cmd, 0, 1);
        const settle = settleMs === void 0 ? 2e3 : parseNumber(settleMs, cmd);
        if (settle > 0) await ctx.sleep(settle);
        await requirePage(ctx, cmd).waitForLoad();
        return;
      }
      case "waitelement":
      case "waitxpath": {
        const [xpath, timeout] = requireArgs(cmd, 1, 2);
        await requirePage(ctx, cmd).waitForXPath(xpath, parseOptionalNumber(timeout, DEFAULT_WAIT_TIMEOUT_MS, cmd));
        return;
      }
      case "getelementattribute": {
        const [xpath, attribute] = requireArgs(cmd, 2);
        runtime.locals.elementAttribute = await requirePage(ctx, cmd).getElementAttribute(xpath, attribute);
        ctx.log(`elementAttribute=${runtime.locals.elementAttribute}`);
        return;
      }
      case "getelementtext": {
        const [xpath] = requireArgs(cmd, 1);
        runtime.locals.elementText = await requirePage(ctx, cmd).getElementText(xpath);
        ctx.log(`elementText=${runtime.locals.elementText}`);
        return;
      }
      case "countelement": {
        const [xpath] = requireArgs(cmd, 1);
        runtime.locals.elementCount = await requirePage(ctx, cmd).countElement(xpath);
        ctx.log(`elementCount=${runtime.locals.elementCount}`);
        return;
      }
      case "click": {
        const [xpath] = requireArgs(cmd, 1);
        await requirePage(ctx, cmd).clickXPath(xpath);
        return;
      }
      case "type":
      case "typetext": {
        const [xpath, ...textParts] = requireArgs(cmd, 2);
        await requirePage(ctx, cmd).typeTextXPath(xpath, textParts.join(" "));
        return;
      }
      case "pastetext": {
        const [xpath, ...textParts] = requireArgs(cmd, 2);
        await requirePage(ctx, cmd).pasteTextXPath(xpath, textParts.join(" "));
        return;
      }
      case "movemouse": {
        const [xpath] = requireArgs(cmd, 1);
        await requirePage(ctx, cmd).moveMouseXPath(xpath);
        return;
      }
      case "scroll": {
        const [px] = requireArgs(cmd, 1);
        await requirePage(ctx, cmd).scroll(parseNumber(px, cmd));
        return;
      }
      case "executejs":
      case "js": {
        const [script] = requireArgs(cmd, 1);
        runtime.locals.jsResult = toFlowValue(await requirePage(ctx, cmd).executeJs(script));
        return;
      }
      case "fileupload": {
        const [filePath, xpath] = requireArgs(cmd, 2);
        await requirePage(ctx, cmd).fileUpload(filePath, xpath);
        return;
      }
      case "httprequest": {
        await executeHttpRequest(cmd, runtime);
        return;
      }
      case "httpdownload": {
        await executeHttpDownload(cmd, runtime);
        ctx.log(`downloadPath=${runtime.locals.downloadPath} downloadBytes=${runtime.locals.downloadBytes}`);
        return;
      }
      case "filewritealltext": {
        const [filePath, ...textParts] = requireArgs(cmd, 2);
        const outputPath = resolve3(filePath);
        await mkdir2(dirname(outputPath), { recursive: true });
        await writeFile3(outputPath, textParts.join(" "), "utf8");
        return;
      }
      case "fileappendtext": {
        const [filePath, ...textParts] = requireArgs(cmd, 2);
        const outputPath = resolve3(filePath);
        await mkdir2(dirname(outputPath), { recursive: true });
        await appendFile(outputPath, textParts.join(" "), "utf8");
        return;
      }
      case "sendkey": {
        const keys = requireArgs(cmd, 1);
        await requirePage(ctx, cmd).sendKey(...keys);
        return;
      }
      case "writeexcel": {
        const [filePath, columnName, rowIndex, ...textParts] = requireArgs(cmd, 4);
        writeExcelCell(filePath, columnName, rowIndex, textParts.join(" "), cmd);
        return;
      }
      case "delay":
      case "sleep": {
        const [min, max] = requireArgs(cmd, 1, 2);
        const minMs = parseNumber(min, cmd);
        const maxMs = max === void 0 ? minMs : parseNumber(max, cmd);
        if (maxMs < minMs) throw lineError(cmd, `delay max (${maxMs}) must be >= min (${minMs}).`);
        const ms = maxMs === minMs ? minMs : minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
        if (maxMs > minMs) ctx.log(`sleep ${ms}ms (random ${minMs}-${maxMs})`);
        await ctx.sleep(ms);
        return;
      }
      case "log": {
        requireArgs(cmd, 1);
        const interpolated = await interpolateCommand(ctx, cmd, runtime);
        ctx.log(interpolated.args.join(" "));
        return;
      }
      case "info": {
        requireArgs(cmd, 0);
        const info = await requirePage(ctx, cmd).info();
        ctx.log(`${info.title} ${info.url}`);
        return;
      }
      case "help": {
        ctx.log("Available commands:");
        ctx.log(COMMAND_LIST);
        ctx.log(RDELAY_DESC);
        ctx.log("Available functions:");
        ctx.log(FUNCTION_LIST);
        return;
      }
      default:
        throw lineError(cmd, `unknown command "${cmd.command}". Available commands:
${COMMAND_LIST}`);
    }
  };
  await runCmd();
  if (hasRDelay) {
    const min = Math.min(rDelayMin, rDelayMax);
    const max = Math.max(rDelayMin, rDelayMax);
    const ms = min + Math.floor(Math.random() * (max - min + 1));
    ctx.log(`rDelay ${ms}ms`);
    await ctx.sleep(ms);
  }
  return void 0;
}
async function executeHttpRequest(item, runtime) {
  const [url, method, headersText, ...bodyParts] = requireArgs(item, 2);
  const responseText = await runHttpRequest(url, method, headersText, bodyParts.join(" ") || void 0, item, runtime);
  return responseText;
}
async function runHttpRequest(url, method, headersText, body, item, runtime) {
  if (!url || !method) throw lineError(item, "httpRequest expects at least 2 arguments.");
  const headers = parseHeaders(headersText, item);
  const response = await fetch(url, { method: method.toUpperCase(), headers, body });
  const headerRecord = {};
  response.headers.forEach((value, key) => {
    headerRecord[key] = value;
  });
  const responseText = await response.text();
  runtime.locals.httpStatus = response.status;
  runtime.locals.httpHeaders = JSON.stringify(headerRecord);
  runtime.locals.httpBody = responseText;
  runtime.locals.httpUrl = response.url;
  return responseText;
}
async function runHttpGet(url, item, runtime) {
  const response = await requestText(url, "GET", item);
  runtime.locals.httpStatus = response.status;
  runtime.locals.httpHeaders = JSON.stringify(response.headers);
  runtime.locals.httpBody = response.body;
  runtime.locals.httpUrl = response.url;
  if (!response.ok) {
    throw lineError(item, `2FA fetch failed: HTTP ${response.status} ${response.statusText}`);
  }
  return response.body;
}
async function requestText(url, method, item) {
  return await new Promise((resolvePromise, rejectPromise) => {
    const target = new URL(url);
    const transport = target.protocol === "https:" ? httpsRequest : httpRequest;
    const req = transport(target, { method, headers: { accept: "application/json" } }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      res.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf8");
        const headers = {};
        for (const [key, value] of Object.entries(res.headers)) {
          headers[key] = Array.isArray(value) ? value.join(", ") : String(value ?? "");
        }
        resolvePromise({
          ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300,
          status: res.statusCode ?? 0,
          statusText: res.statusMessage ?? "",
          headers,
          body,
          url: target.toString()
        });
      });
    });
    req.on("error", (error) => rejectPromise(new AppError(`HTTP request failed: ${error instanceof Error ? error.message : String(error)}`, error)));
    req.end();
  });
}
async function executeHttpDownload(item, runtime) {
  const [url, savePath] = requireArgs(item, 2);
  const response = await fetch(url);
  if (!response.ok) throw lineError(item, `download failed: HTTP ${response.status} ${response.statusText}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const outputPath = resolve3(savePath);
  await mkdir2(dirname(outputPath), { recursive: true });
  await writeFile3(outputPath, bytes);
  runtime.locals.downloadPath = outputPath;
  runtime.locals.downloadBytes = bytes.byteLength;
}
function parseHeaders(value, item) {
  if (!value) return void 0;
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("headers must be an object");
    const headers = {};
    for (const [key, itemValue] of Object.entries(parsed)) headers[key] = String(itemValue);
    return headers;
  } catch (error) {
    throw lineError(item, `invalid headers JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}
async function evaluateExpression(ctx, expression, runtime, item) {
  switch (expression.type) {
    case "literal":
      return expression.value;
    case "variable": {
      if (expression.name === "loopIndex") return runtime.loopIndexStack[runtime.loopIndexStack.length - 1] ?? -1;
      if (expression.name in runtime.locals) return runtime.locals[expression.name] ?? null;
      if (expression.name in ctx.inputs) return ctx.inputs[expression.name] ?? null;
      const available = [...Object.keys(ctx.inputs), ...Object.keys(runtime.locals), "loopIndex"].join(", ");
      throw lineError(item, `unknown variable "${expression.name}". Available: ${available || "(none)"}`);
    }
    case "unary": {
      const value = await evaluateExpression(ctx, expression.argument, runtime, item);
      if (expression.operator === "!") return !isTruthy(value);
      return -toNumber(value, item);
    }
    case "binary": {
      if (expression.operator === "&&") {
        const left2 = await evaluateExpression(ctx, expression.left, runtime, item);
        return isTruthy(left2) && isTruthy(await evaluateExpression(ctx, expression.right, runtime, item));
      }
      if (expression.operator === "||") {
        const left2 = await evaluateExpression(ctx, expression.left, runtime, item);
        return isTruthy(left2) || isTruthy(await evaluateExpression(ctx, expression.right, runtime, item));
      }
      const left = await evaluateExpression(ctx, expression.left, runtime, item);
      const right = await evaluateExpression(ctx, expression.right, runtime, item);
      return evaluateBinary(expression.operator, left, right, item);
    }
    case "call": {
      const name = expression.name.toLowerCase();
      const args = [];
      for (const arg of expression.args) {
        try {
          args.push(await evaluateExpression(ctx, arg, runtime, item));
        } catch (error) {
          if (arg.type === "variable" && error instanceof AppError && error.message.includes(`unknown variable "${arg.name}"`)) {
            args.push(arg.name);
          } else {
            throw error;
          }
        }
      }
      if (name === "haselement" || name === "existsxpath") {
        if (args.length !== 1) throw lineError(item, `${expression.name} expects 1 argument.`);
        return requirePage(ctx, item).existsXPath(String(args[0] ?? ""));
      }
      if (name === "geturl") {
        if (args.length !== 0) throw lineError(item, `${expression.name} expects 0 arguments.`);
        return requirePage(ctx, item).getUrl();
      }
      if (name === "js" || name === "executejs") {
        if (args.length !== 1) throw lineError(item, `${expression.name} expects 1 argument.`);
        return toFlowValue(await requirePage(ctx, item).executeJs(String(args[0] ?? "")));
      }
      if (name === "getelementtext") {
        if (args.length !== 1) throw lineError(item, `${expression.name} expects 1 argument.`);
        return requirePage(ctx, item).getElementText(String(args[0] ?? ""));
      }
      if (name === "getelementattribute") {
        if (args.length !== 2) throw lineError(item, `${expression.name} expects 2 arguments.`);
        return requirePage(ctx, item).getElementAttribute(String(args[0] ?? ""), String(args[1] ?? ""));
      }
      if (name === "countelement") {
        if (args.length !== 1) throw lineError(item, `${expression.name} expects 1 argument.`);
        return requirePage(ctx, item).countElement(String(args[0] ?? ""));
      }
      if (name === "httprequest") {
        if (args.length < 2 || args.length > 4) throw lineError(item, `${expression.name} expects 2-4 arguments.`);
        const url2 = await interpolate(ctx, String(args[0] ?? ""), runtime, item);
        const method2 = String(args[1] ?? "");
        const headers2 = args[2] === void 0 ? void 0 : String(args[2]);
        const body2 = args[3] === void 0 ? void 0 : String(args[3]);
        return runHttpRequest(url2, method2, headers2, body2, item, runtime);
      }
      if (name === "splittext") {
        if (args.length !== 2) throw lineError(item, `${expression.name} expects 2 arguments.`);
        return String(args[0] ?? "").split(String(args[1] ?? ""));
      }
      if (name === "contains") {
        if (args.length !== 2) throw lineError(item, `${expression.name} expects 2 arguments.`);
        const left = String(args[0] ?? "");
        const right = String(args[1] ?? "");
        return left === "" ? right === "" : left.includes(right);
      }
      if (name === "readjson") {
        if (args.length !== 2) throw lineError(item, `${expression.name} expects 2 arguments.`);
        return readJsonValue(String(args[0] ?? ""), String(args[1] ?? ""), item);
      }
      if (name === "randomnum") {
        if (args.length !== 2) throw lineError(item, `${expression.name} expects 2 arguments.`);
        const min = toNumber(args[0], item);
        const max = toNumber(args[1], item);
        if (max < min) throw lineError(item, `randomNum max (${max}) must be >= min (${min}).`);
        return min + Math.floor(Math.random() * (max - min + 1));
      }
      if (name === "fileexist") {
        if (args.length !== 1) throw lineError(item, `${expression.name} expects 1 argument.`);
        return pathExists2(await interpolate(ctx, String(args[0] ?? ""), runtime, item), "file");
      }
      if (name === "folderexist") {
        if (args.length !== 1) throw lineError(item, `${expression.name} expects 1 argument.`);
        return pathExists2(await interpolate(ctx, String(args[0] ?? ""), runtime, item), "folder");
      }
      if (name === "getfiles") {
        if (args.length !== 1) throw lineError(item, `${expression.name} expects 1 argument.`);
        const folderPath = await interpolate(ctx, String(args[0] ?? ""), runtime, item);
        const dirents = await readdir(resolve3(folderPath), { withFileTypes: true });
        return dirents.filter((d) => d.isFile()).map((d) => resolve3(folderPath, d.name));
      }
      if (name === "arraylength") {
        if (args.length !== 1) throw lineError(item, `${expression.name} expects 1 argument.`);
        const val = args[0];
        if (!Array.isArray(val)) throw lineError(item, `arrayLength expects an array, got "${typeof val}".`);
        return val.length;
      }
      if (name === "readexcel") {
        if (args.length !== 3) throw lineError(item, `${expression.name} expects 3 arguments.`);
        const filePath = await interpolate(ctx, String(args[0] ?? ""), runtime, item);
        return readExcelCell(filePath, args[1], args[2], item);
      }
      if (name === "findrow") {
        if (args.length !== 2) throw lineError(item, `${expression.name} expects 2 arguments.`);
        const filePath = await interpolate(ctx, String(args[0] ?? ""), runtime, item);
        return findExcelRow(filePath, String(args[1] ?? ""), item);
      }
      if (name === "filereadalltext") {
        if (args.length !== 1) throw lineError(item, `${expression.name} expects 1 argument.`);
        const filePath2 = await interpolate(ctx, String(args[0] ?? ""), runtime, item);
        return await readFile(resolve3(filePath2), "utf8");
      }
      if (name === "2fa") {
        if (args.length !== 1) throw lineError(item, `${expression.name} expects 1 argument.`);
        const secret = encodeURIComponent(String(args[0] ?? ""));
        const responseText = await runHttpGet(`https://2fa.live/tok/${secret}`, item, runtime);
        let body;
        try {
          body = JSON.parse(responseText);
        } catch (error) {
          throw lineError(item, `2FA response is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
        }
        if (typeof body.token !== "string") throw lineError(item, `2FA response missing token field.`);
        return body.token;
      }
      if (runtime.excelInputs.has(name)) {
        if (args.length === 1 && isTruthy(ctx.inputs.mapProfileName)) {
          const col2 = await interpolate(ctx, String(args[0] ?? ""), runtime, item);
          return readExcelInputCellByProfile(ctx, col2.toUpperCase(), expression.name, item);
        }
        if (args.length !== 2) throw lineError(item, `${expression.name} expects 2 arguments, or 1 argument when mapProfileName is enabled.`);
        const inputName = Object.keys(ctx.inputs).find((key) => key.toLowerCase() === name) ?? expression.name;
        const fpath = await interpolate(ctx, String(ctx.inputs[inputName] ?? ""), runtime, item);
        const col = await interpolate(ctx, String(args[0] ?? ""), runtime, item);
        const row = await interpolate(ctx, String(args[1] ?? ""), runtime, item);
        return readExcelCell(fpath, col, row, item);
      }
      throw lineError(item, `unknown function "${expression.name}". Available functions:
${FUNCTION_LIST}`);
    }
    case "index": {
      const object = await evaluateExpression(ctx, expression.object, runtime, item);
      if (expression.object.type === "variable" && runtime.excelInputs.has(expression.object.name.toLowerCase())) {
        if (isTruthy(ctx.inputs.mapProfileName)) {
          let colLetter;
          if (expression.index.type === "variable" && /^[A-Za-z]+$/.test(expression.index.name)) {
            colLetter = expression.index.name.toUpperCase();
          } else if (expression.index.type === "literal" && typeof expression.index.value === "string" && /^[A-Za-z]+$/.test(expression.index.value)) {
            colLetter = expression.index.value.toUpperCase();
          } else {
            const idx = await evaluateExpression(ctx, expression.index, runtime, item);
            colLetter = String(idx).toUpperCase();
          }
          return readExcelInputCellByProfile(ctx, colLetter, expression.object.name, item);
        }
      }
      const indexValue = await evaluateExpression(ctx, expression.index, runtime, item);
      if (!Array.isArray(object)) throw lineError(item, `cannot index non-array value "${String(object)}".`);
      const index = toNumber(indexValue, item);
      if (!Number.isInteger(index)) throw lineError(item, `array index must be an integer, got "${String(indexValue)}".`);
      return object[index] ?? null;
    }
  }
}
function evaluateBinary(operator, left, right, item) {
  switch (operator) {
    case "+":
      if (typeof left === "string" || typeof right === "string") return String(left ?? "") + String(right ?? "");
      return toNumber(left, item) + toNumber(right, item);
    case "-":
      return toNumber(left, item) - toNumber(right, item);
    case "*":
      return toNumber(left, item) * toNumber(right, item);
    case "/":
      return toNumber(left, item) / toNumber(right, item);
    case "%":
      return toNumber(left, item) % toNumber(right, item);
    case "==":
      return left === right;
    case "!=":
      return left !== right;
    case "<":
      return toNumber(left, item) < toNumber(right, item);
    case "<=":
      return toNumber(left, item) <= toNumber(right, item);
    case ">":
      return toNumber(left, item) > toNumber(right, item);
    case ">=":
      return toNumber(left, item) >= toNumber(right, item);
    case "&&":
    case "||":
      return false;
  }
  throw lineError(item, `unknown operator "${operator}".`);
}
function validateStatementsForBlock(statements, block) {
  for (const statement of statements) validateStatementForBlock(statement, block);
}
function validateStatementForBlock(statement, block) {
  if (block === "main") return;
  if (statement.type === "command") {
    const command = statement.command.toLowerCase();
    if (command !== "log" && PAGE_COMMANDS.has(command)) {
      throw lineError(statement, `${statement.command} can only be used inside run profile block because it interacts with webpage.`);
    }
  }
  if (statement.type === "if") {
    for (const branch of statement.branches) {
      validateExpressionForBlock(branch.condition, block, statement);
      validateStatementsForBlock(branch.body, block);
    }
    if (statement.elseBody) validateStatementsForBlock(statement.elseBody, block);
  } else if (statement.type === "while") {
    validateExpressionForBlock(statement.condition, block, statement);
    validateStatementsForBlock(statement.body, block);
  } else if (statement.type === "for") {
    validateExpressionForBlock(statement.init.value, block, statement);
    validateExpressionForBlock(statement.condition, block, statement);
    validateExpressionForBlock(statement.update.value, block, statement);
    validateStatementsForBlock(statement.body, block);
  } else if (statement.type === "assignment") {
    validateExpressionForBlock(statement.value, block, statement);
  }
}
function validateExpressionForBlock(expression, block, item) {
  if (block === "main") return;
  if (expression.type === "call") {
    const name = expression.name.toLowerCase();
    if (name !== "log" && PAGE_FUNCTIONS.has(name)) throw lineError(item, `${expression.name} can only be used inside run profile block.`);
  }
  if (expression.type === "unary") validateExpressionForBlock(expression.argument, block, item);
  if (expression.type === "binary") {
    validateExpressionForBlock(expression.left, block, item);
    validateExpressionForBlock(expression.right, block, item);
  }
  if (expression.type === "call") {
    for (const arg of expression.args) validateExpressionForBlock(arg, block, item);
  }
  if (expression.type === "index") {
    validateExpressionForBlock(expression.object, block, item);
    validateExpressionForBlock(expression.index, block, item);
  }
}
async function interpolateCommand(ctx, command, runtime) {
  const args = [];
  for (const arg of command.args) args.push(await interpolate(ctx, arg, runtime, command));
  return { ...command, args };
}
function formatFlowCommand(command) {
  return `${command.command}(${command.args.map(formatFlowArg).join(", ")})`;
}
function formatFlowArg(value) {
  return `"${value.replace(/"/g, '""')}"`;
}
async function interpolate(ctx, value, runtime, item) {
  let result = "";
  let lastIndex = 0;
  const pattern = /\$\{([^}]+)\}/g;
  let match;
  while ((match = pattern.exec(value)) !== null) {
    result += value.slice(lastIndex, match.index);
    const expressionText = match[1] ?? "";
    const evaluated = await evaluateExpression(ctx, parseExpression(expressionText, item.lineNumber), runtime, item);
    result += flowValueToString(evaluated);
    lastIndex = pattern.lastIndex;
  }
  return result + value.slice(lastIndex);
}
async function pathExists2(filePath, kind) {
  const stats = await stat3(resolve3(filePath)).catch(() => null);
  return kind === "file" ? stats?.isFile() ?? false : stats?.isDirectory() ?? false;
}
function readJsonValue(text, path2, item) {
  let current;
  try {
    current = JSON.parse(text);
  } catch (error) {
    throw lineError(item, `readJson invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  for (const key of path2.split(".").filter(Boolean)) {
    if (current === null || typeof current !== "object" || !(key in current)) return null;
    current = current[key];
  }
  return toFlowValue(current);
}
function readExcelCell(filePath, columnName, rowIndex, item) {
  const workbook = XLSX.readFile(resolve3(filePath));
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return null;
  const sheet = workbook.Sheets[sheetName];
  if (!sheet?.["!ref"]) return null;
  const column = findExcelColumn(sheet, String(columnName ?? ""), item);
  const row = parseExcelDataRow(rowIndex, item);
  const cell = sheet[XLSX.utils.encode_cell({ c: column, r: row })];
  return toFlowValue(cell?.v);
}
function findExcelRow(filePath, searchText, item) {
  const workbook = XLSX.readFile(resolve3(filePath));
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return null;
  const sheet = workbook.Sheets[sheetName];
  if (!sheet?.["!ref"]) return null;
  const range2 = XLSX.utils.decode_range(sheet["!ref"]);
  for (let r = range2.s.r; r <= range2.e.r; r++) {
    for (let c = range2.s.c; c <= range2.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ c, r })];
      if (String(cell?.v ?? "") === searchText) return r;
    }
  }
  return null;
}
function findExcelRowByColumnA(filePath, profileName, item) {
  const workbook = XLSX.readFile(resolve3(filePath));
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw lineError(item, `profile name "${profileName}" not found in column A of inputExcelFile: sheet is empty.`);
  const sheet = workbook.Sheets[sheetName];
  if (!sheet?.["!ref"]) throw lineError(item, `profile name "${profileName}" not found in column A of inputExcelFile: sheet is empty.`);
  const range2 = XLSX.utils.decode_range(sheet["!ref"]);
  for (let r = range2.s.r; r <= range2.e.r; r++) {
    const cell = sheet[XLSX.utils.encode_cell({ c: 0, r })];
    if (String(cell?.v ?? "") === profileName) return r;
  }
  throw lineError(item, `profile name "${profileName}" not found in column A of inputExcelFile: ${filePath}`);
}
function resolveExcelInputFilePath(ctx, inputName) {
  const key = Object.keys(ctx.inputs).find((k) => k.toLowerCase() === inputName) ?? inputName;
  return String(ctx.inputs[key] ?? "");
}
function readExcelInputCellByProfile(ctx, colLetter, inputName, item) {
  const fpath = resolveExcelInputFilePath(ctx, inputName);
  const profileName = String(ctx.inputs.profileName ?? "");
  if (!profileName) throw lineError(item, "profileName is empty; cannot map profile name to Excel row.");
  const row = findExcelRowByColumnA(fpath, profileName, item);
  return readExcelCell(fpath, colLetter, row, item);
}
function writeExcelCell(filePath, columnName, rowIndexText, value, item) {
  const outputPath = resolve3(filePath);
  let workbook;
  let sheetName;
  let sheet;
  try {
    workbook = XLSX.readFile(outputPath);
    sheetName = workbook.SheetNames[0] ?? "Sheet1";
    sheet = workbook.Sheets[sheetName] ?? XLSX.utils.aoa_to_sheet([[columnName]]);
    if (!workbook.SheetNames.includes(sheetName)) XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  } catch {
    workbook = XLSX.utils.book_new();
    sheetName = "Sheet1";
    sheet = XLSX.utils.aoa_to_sheet([[columnName]]);
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  }
  const column = findExcelColumn(sheet, columnName, item);
  const row = parseExcelDataRow(rowIndexText, item);
  XLSX.utils.sheet_add_aoa(sheet, [[value]], { origin: { c: column, r: row } });
  XLSX.writeFile(workbook, outputPath);
}
function findExcelColumn(sheet, columnName, item) {
  if (!sheet["!ref"]) throw lineError(item, "Excel sheet is empty.");
  const range2 = XLSX.utils.decode_range(sheet["!ref"]);
  for (let column = range2.s.c; column <= range2.e.c; column += 1) {
    const cell = sheet[XLSX.utils.encode_cell({ c: column, r: 0 })];
    if (String(cell?.v ?? "") === columnName) return column;
  }
  const colLetter = columnName.toUpperCase();
  if (/^[A-Z]+$/.test(colLetter)) {
    let colIndex = 0;
    for (let i = 0; i < colLetter.length; i++) {
      colIndex = colIndex * 26 + (colLetter.charCodeAt(i) - 64);
    }
    return colIndex - 1;
  }
  throw lineError(item, `Excel column not found: ${columnName}`);
}
function parseExcelDataRow(rowIndex, item) {
  const parsed = toNumber(rowIndex, item);
  if (!Number.isInteger(parsed) || parsed < 1) throw lineError(item, `Excel row index must be a positive integer, got "${String(rowIndex)}".`);
  return parsed;
}
function flowValueToString(value) {
  if (value === null) return "";
  if (Array.isArray(value)) return value.map((item) => flowValueToString(item)).join(",");
  return String(value);
}
function requirePage(ctx, item) {
  if (!ctx.page) throw lineError(item, `${item.command ?? "page function"} requires run profile block with an active page.`);
  return ctx.page;
}
function requireArgs(item, min, max = Infinity) {
  if (item.args.length < min || item.args.length > max) {
    const expected = max === Infinity ? `at least ${min}` : min === max ? `${min}` : `${min}-${max}`;
    throw lineError(item, `expected ${expected} args, got ${item.args.length}.`);
  }
  return item.args;
}
function parseOptionalNumber(value, fallback, item) {
  return value === void 0 ? fallback : parseNumber(value, item);
}
function parseNumber(value, item) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw lineError(item, `invalid number "${value}".`);
  return parsed;
}
function toNumber(value, item) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw lineError(item, `expected number, got "${String(value)}".`);
  return parsed;
}
function toFlowValue(value) {
  if (value === null || value === void 0) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map((item) => toFlowValue(item)).filter((item) => item !== null);
  return JSON.stringify(value);
}
function isTruthy(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return false;
}
function lineError(item, message) {
  return new AppError(`Line ${item.lineNumber}: ${message}
  ${item.raw}`);
}

// src/runtime/script-loader.ts
async function loadEsbuild() {
  return Promise.resolve().then(() => __toESM(require_main2(), 1));
}
var BUILTIN_SCRIPTS = {
  threads: "scripts/threads.ts"
};
function resolveScriptPath(spec) {
  if (BUILTIN_SCRIPTS[spec]) {
    return resolve4(process.cwd(), BUILTIN_SCRIPTS[spec]);
  }
  if (isAbsolute2(spec)) {
    return spec;
  }
  return resolve4(process.cwd(), spec);
}
function toPosixPath2(path2) {
  return path2.split(sep2).join("/");
}
async function listScriptFiles() {
  const scriptsDir = resolve4(process.cwd(), "scripts");
  let entries;
  try {
    entries = await readdir2(scriptsDir);
  } catch {
    return [];
  }
  const allowTs = !isPackagedExecutable();
  return entries.filter((entry) => entry.endsWith(".flow") || allowTs && entry.endsWith(".ts")).map((entry) => toPosixPath2(relative2(process.cwd(), join3(scriptsDir, entry)))).sort((a, b) => a.localeCompare(b));
}
async function selectScript(defaultScript) {
  if (process.stdin.isTTY) {
    process.stdin.resume();
  }
  const scriptFiles = await listScriptFiles();
  const builtinPaths = new Set(isPackagedExecutable() ? [] : Object.values(BUILTIN_SCRIPTS));
  const choices = [
    ...!isPackagedExecutable() ? Object.keys(BUILTIN_SCRIPTS).map((name) => ({
      label: `${name} (built-in)`,
      value: name
    })) : [],
    ...scriptFiles.filter((file) => !builtinPaths.has(file)).map((file) => ({
      label: `${file}`,
      value: file
    })),
    { label: "Back", value: "__exit__" }
  ];
  if (choices.length === 1) {
    throw new AppError(isPackagedExecutable() ? "No .flow workflow scripts found. Add a .flow file in scripts/, or pass --script <path>." : "No workflow scripts found. Add a .ts or .flow file in scripts/, or pass --script <path>.");
  }
  const ui = await getUi();
  const selected = await ui.runListPicker({
    title: `Run Scripts (${choices.length - 1} found)`,
    options: choices,
    initialValue: defaultScript,
    cancelHint: "back"
  });
  if (selected === void 0 || selected === "__exit__") {
    throw globalAbort.signal.aborted ? new AppError("Aborted") : new AppError("Exit");
  }
  return selected;
}
var CACHE_ROOT = join3(tmpdir2(), "donumate", "script-cache");
var CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1e3;
function createRunId() {
  const time = Date.now().toString(36);
  const pid = process.pid.toString(36);
  const rand = randomBytes(4).toString("hex");
  return `${time}-${pid}-${rand}`;
}
async function createCacheDir() {
  const dir = join3(CACHE_ROOT, createRunId());
  await mkdir3(dir, { recursive: true });
  return dir;
}
async function pruneOldCaches() {
  let entries;
  try {
    entries = await readdir2(CACHE_ROOT);
  } catch {
    return;
  }
  const now = Date.now();
  for (const entry of entries) {
    const entryPath = join3(CACHE_ROOT, entry);
    try {
      const { statSync } = await import("node:fs");
      const st = statSync(entryPath);
      if (now - st.mtimeMs > CACHE_MAX_AGE_MS) {
        await rm2(entryPath, { recursive: true, force: true }).catch(() => {
        });
      }
    } catch {
    }
  }
}
function makeCleanup(dir) {
  return async () => {
    try {
      await rm2(dir, { recursive: true, force: true });
    } catch {
    }
  };
}
async function loadWorkflow(spec) {
  const filePath = resolveScriptPath(spec);
  pruneOldCaches().catch(() => {
  });
  const cacheDir = await createCacheDir();
  if (filePath.endsWith(".flow")) {
    return loadFlowWorkflow(filePath, cacheDir);
  }
  return loadTsWorkflow(spec, filePath, cacheDir);
}
async function loadFlowWorkflow(filePath, cacheDir) {
  const cachedPath = join3(cacheDir, "workflow.flow");
  try {
    const source = await readFile2(filePath, "utf8");
    await writeFile4(cachedPath, source, "utf8");
    const program3 = await loadFlowProgram(cachedPath);
    return {
      kind: "flow",
      program: program3,
      filePath,
      cachedPath,
      cacheDir,
      cleanup: makeCleanup(cacheDir)
    };
  } catch (error) {
    await rm2(cacheDir, { recursive: true, force: true }).catch(() => {
    });
    throw new AppError(`Failed to load flow script: ${filePath}`, error);
  }
}
async function loadTsWorkflow(spec, filePath, cacheDir) {
  const cachedPath = join3(cacheDir, "workflow.mjs");
  try {
    const { build: esbuild } = await loadEsbuild();
    await esbuild({
      entryPoints: [filePath],
      outfile: cachedPath,
      bundle: true,
      platform: "node",
      format: "esm",
      target: "node22",
      sourcemap: "inline",
      packages: "external"
    });
    const runId = createRunId();
    const fileUrl = pathToFileURL(cachedPath).href + "?run=" + encodeURIComponent(runId);
    const run = await importCachedScript(spec, filePath, fileUrl);
    return {
      kind: "ts",
      run,
      filePath,
      cachedPath,
      cacheDir,
      cleanup: makeCleanup(cacheDir)
    };
  } catch (error) {
    await rm2(cacheDir, { recursive: true, force: true }).catch(() => {
    });
    if (error instanceof AppError) throw error;
    throw new AppError(`Failed to bundle/cache script: ${filePath}`, error);
  }
}
async function importCachedScript(spec, originalPath, fileUrl) {
  let mod;
  try {
    mod = await import(fileUrl);
  } catch (error) {
    throw new AppError(`Failed to import script: ${originalPath}`, error);
  }
  const fn = typeof mod === "object" && mod !== null && "default" in mod ? mod.default : mod;
  if (typeof fn !== "function") {
    throw new AppError(
      `Script ${spec} (${originalPath}) does not export a default function.
Expected: export default async function(ctx: WorkflowContext) { ... }`
    );
  }
  return fn;
}

// src/runtime/dsl/input-values.ts
init_errors();
import { stat as stat4 } from "fs/promises";
import { resolve as resolve5 } from "path";
import XLSX2 from "xlsx";
var XLSXApi = XLSX2;
var NUMBER_PATTERN = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;
function stringifyInputValues(values) {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value)]));
}
function initialInputText(input, overrides) {
  if (overrides[input.name] !== void 0) return overrides[input.name];
  if (input.defaultValue !== void 0) return String(input.defaultValue);
  if (input.type === "checkbox") return "false";
  if (input.type === "comboBox") return input.options?.[0] ?? "";
  return "";
}
async function coerceAndValidateInputs(definitions, rawValues) {
  const values = {};
  for (const input of definitions) {
    values[input.name] = await coerceAndValidateInput(input, rawValues[input.name] ?? initialInputText(input, {}));
    if (input.type === "inputExcelFile") {
      const filePath = String(values[input.name]);
      values[`${input.name}TotalRow`] = filePath ? readExcelTotalRows(filePath) : 0;
    }
  }
  return values;
}
async function coerceAndValidateInput(input, rawValue) {
  const value = rawValue.trim();
  switch (input.type) {
    case "input":
      return autodetectValue2(value);
    case "text":
      return rawValue;
    case "number": {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) throw new AppError(`${input.name}: expected a number, got "${rawValue || "(empty)"}".`);
      return parsed;
    }
    case "checkbox":
      if (/^(true|1|yes|on)$/i.test(value)) return true;
      if (/^(false|0|no|off)$/i.test(value)) return false;
      throw new AppError(`${input.name}: expected true/false/1/0/yes/no, got "${rawValue}".`);
    case "comboBox":
      if (!input.options?.includes(value)) throw new AppError(`${input.name}: expected one of [${input.options?.join(", ")}], got "${value}".`);
      return value;
    case "file":
    case "inputExcelFile": {
      if (input.type === "inputExcelFile" && value === "" && input.defaultValue !== void 0) return "";
      const filePath = resolvePath(value);
      const stats = await stat4(filePath).catch(() => null);
      if (!stats?.isFile()) throw new AppError(`${input.name}: file not found: ${filePath}`);
      return filePath;
    }
    case "folder": {
      const folderPath = resolvePath(value);
      const stats = await stat4(folderPath).catch(() => null);
      if (!stats?.isDirectory()) throw new AppError(`${input.name}: folder not found: ${folderPath}`);
      return folderPath;
    }
  }
}
function autodetectValue2(value) {
  if (NUMBER_PATTERN.test(value)) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return value;
}
function resolvePath(value) {
  if (value.startsWith("~")) {
    return resolve5(process.env.USERPROFILE ?? process.env.HOME ?? process.cwd(), value.slice(1));
  }
  return resolve5(process.cwd(), value);
}
function readExcelTotalRows(filePath) {
  const workbook = XLSXApi.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return 0;
  const sheet = workbook.Sheets[sheetName];
  if (!sheet?.["!ref"]) return 0;
  const range2 = XLSX2.utils.decode_range(sheet["!ref"]);
  return range2.e.r + 1;
}

// src/ui/run-flow-input-form.ts
init_errors();
init_list_picker();
init_text_input_prompt();

// src/ui/path-browser.ts
init_list_picker();
init_text_input_prompt();
import { readdir as readdir3 } from "fs/promises";
import { dirname as dirname2, join as join4, parse, resolve as resolve6 } from "path";
async function listDrives() {
  const drives = [];
  for (let ch = 65; ch <= 90; ch++) {
    const letter = String.fromCharCode(ch);
    try {
      await readdir3(`${letter}:\\`);
      drives.push(`${letter}:\\`);
    } catch {
    }
  }
  return drives;
}
async function browsePath(mode, initialPath) {
  let cwd;
  if (initialPath) {
    cwd = resolve6(process.cwd(), initialPath);
    try {
      const stat6 = await import("fs/promises").then((m) => m.stat(cwd));
      if (stat6.isFile()) cwd = dirname2(cwd);
    } catch {
      cwd = dirname2(resolve6(process.cwd(), initialPath));
    }
  } else {
    cwd = process.cwd();
  }
  while (true) {
    let items = [];
    try {
      const dirents = await readdir3(cwd, { withFileTypes: true });
      items = dirents.map((item) => ({ name: item.name, isDirectory: item.isDirectory() })).sort((a, b) => Number(b.isDirectory) - Number(a.isDirectory) || a.name.localeCompare(b.name));
    } catch {
      items = [];
    }
    const options = [];
    const parsed = parse(cwd);
    const root = parsed.root;
    if (mode === "folder") {
      options.push({ value: "__choose__", label: `Select current folder (${cwd})` });
    }
    options.push({ value: "__type__", label: "Type/paste path manually" });
    if (cwd === root || cwd === root.slice(0, -1)) {
      const drives = await listDrives();
      for (const drive of drives) {
        if (drive !== root) {
          options.push({ value: "__drive__" + drive, label: `[Drive] ${drive}` });
        }
      }
    }
    if (cwd !== root && cwd !== root.slice(0, -1)) {
      options.push({ value: "__parent__", label: ".. (Parent Directory)" });
    }
    for (const item of items) {
      options.push({
        value: join4(cwd, item.name),
        label: `${item.isDirectory ? "[Dir]" : "[File]"} ${item.name}`
      });
    }
    options.push({ value: "__cancel__", label: "Cancel (Back to Form)" });
    const choice = await runListPicker({
      title: `Browse ${mode} in ${cwd}`,
      options,
      submitHint: "open/select",
      cancelHint: "cancel"
    });
    if (choice === void 0 || choice === "__cancel__") return initialPath;
    if (choice === "__choose__") return cwd;
    if (choice === "__type__") {
      const manualPath = await runTextInputPrompt({
        title: `Enter ${mode} path`,
        defaultValue: cwd
      });
      if (manualPath === void 0) continue;
      return resolve6(cwd, manualPath);
    }
    if (typeof choice === "string" && choice.startsWith("__drive__")) {
      cwd = choice.slice("__drive__".length);
      continue;
    }
    if (choice === "__parent__") {
      cwd = cwd === root ? root : dirname2(cwd);
      continue;
    }
    const selectedItem = items.find((item) => join4(cwd, item.name) === choice);
    if (selectedItem?.isDirectory) {
      cwd = choice;
    } else if (mode === "file") {
      return choice;
    }
  }
}

// src/ui/run-flow-input-form.ts
var SCRIPT_SETTING_NAMES = /* @__PURE__ */ new Set(["hardless", "threads", "inputExcelFile", "mapProfileName", "windowWidth", "windowHeight"]);
var SCRIPT_SETTING_LABELS = {
  hardless: "Kh\xF4ng c\u1EEDa s\u1ED5 (hardless)",
  threads: "S\u1ED1 lu\u1ED3ng c\xF9ng l\xFAc (threads)",
  inputExcelFile: "File excel \u0111\u1EA7u v\xE0o (inputExcelFile)",
  mapProfileName: "Map profile name (mapProfileName)",
  windowWidth: "R\u1ED9ng window (windowWidth)",
  windowHeight: "Cao window (windowHeight)"
};
function displayInputValue(def, value) {
  if (def.type === "checkbox") {
    return /^(true|1|yes|on)$/i.test(value) ? "true" : "false";
  }
  if (def.type === "inputExcelFile" && value === "") return "kh\xF4ng c\xF3";
  return value || "<empty>";
}
function displayInputLabel(def, value) {
  const label = SCRIPT_SETTING_LABELS[def.name] ?? `${def.name} (${def.type})`;
  return `${label} = ${displayInputValue(def, value)}`;
}
async function editFlowInput(def, currentVal) {
  if (def.type === "checkbox") {
    const res2 = await runListPicker({
      title: `Set ${def.name}`,
      options: [
        { value: "true", label: "true" },
        { value: "false", label: "false" }
      ],
      initialValue: /^(true|1|yes|on)$/i.test(currentVal) ? "true" : "false",
      cancelHint: "keep current"
    });
    return res2 ?? currentVal;
  }
  if (def.type === "comboBox") {
    const options = (def.options ?? []).map((option) => ({ value: option, label: option }));
    const res2 = await runListPicker({
      title: `Pick ${def.name}`,
      options,
      initialValue: currentVal || def.options?.[0],
      cancelHint: "keep current"
    });
    return res2 ?? currentVal;
  }
  if (def.type === "inputExcelFile") {
    const action = await runListPicker({
      title: `Set ${def.name}`,
      options: [
        { value: "browse", label: "Browse file" },
        { value: "manual", label: "Enter path manually" },
        { value: "clear", label: "Kh\xF4ng c\xF3 file" }
      ],
      initialValue: currentVal ? "browse" : "clear",
      cancelHint: "keep current"
    });
    if (action === "clear") return "";
    if (action === "manual") {
      const res2 = await runTextInputPrompt({
        title: `Enter value for ${def.name} (${def.type})`,
        defaultValue: currentVal
      });
      return res2 ?? currentVal;
    }
    if (action === "browse") return browsePath("file", currentVal);
    return currentVal;
  }
  if (def.type === "file" || def.type === "folder") {
    const mode = def.type === "folder" ? "folder" : "file";
    return browsePath(mode, currentVal);
  }
  const res = await runTextInputPrompt({
    title: `Enter value for ${def.name} (${def.type})`,
    defaultValue: currentVal,
    validate(value) {
      if (def.type === "number") {
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) return "Must be a finite number";
      }
      return void 0;
    }
  });
  return res ?? currentVal;
}
function createInputChoices(definitions, values, settingsExpanded) {
  const settingDefs = definitions.filter((def) => SCRIPT_SETTING_NAMES.has(def.name));
  const userDefs = definitions.filter((def) => !SCRIPT_SETTING_NAMES.has(def.name));
  const choices = [
    { value: "__submit__", label: "Run flow" }
  ];
  if (settingDefs.length > 0) {
    choices.push({ value: "__settings__", label: `${settingsExpanded ? "\u25BE" : "\u25B8"} Scripts Setting` });
    if (settingsExpanded) {
      choices.push(...settingDefs.map((def) => ({
        value: def.name,
        label: `  \u251C\u2500 ${displayInputLabel(def, values[def.name] || "")}`
      })));
    }
  }
  choices.push(...userDefs.map((def) => ({
    value: def.name,
    label: displayInputLabel(def, values[def.name] || "")
  })));
  return choices;
}
async function runFlowInputForm(definitions, overrides, initialState) {
  if (definitions.length === 0) return { values: {}, state: { values: {}, cursor: 0 } };
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    const missing = definitions.filter((d) => !overrides[d.name] && d.defaultValue === void 0 && (d.type === "file" || d.type === "folder"));
    if (missing.length > 0) {
      process.stderr.write(`Warning: non-TTY mode \u2014 required fields not set: ${missing.map((d) => d.name).join(", ")}
`);
    }
    const validated = await coerceAndValidateInputs(definitions, Object.fromEntries(definitions.map((item) => [item.name, initialInputText(item, overrides)])));
    return { values: validated, state: { values: {}, cursor: 0 } };
  }
  const values = initialState?.values ? { ...Object.fromEntries(definitions.map((item) => [item.name, initialInputText(item, overrides)])), ...initialState.values } : Object.fromEntries(definitions.map((item) => [item.name, initialInputText(item, overrides)]));
  let cursor = initialState?.cursor ?? 0;
  let validationError;
  let settingsExpanded = false;
  while (true) {
    const choices = createInputChoices(definitions, values, settingsExpanded);
    if (cursor >= choices.length) cursor = choices.length - 1;
    const title = validationError ? `Flow Inputs Form

Validation Error: ${validationError}

Enter opens/toggles selected item. Direct picker opens for checkbox/comboBox/file/folder.` : "Flow Inputs Form\n\nEnter opens/toggles selected item. Direct picker opens for checkbox/comboBox/file/folder.";
    const selection = await runListPicker({
      title,
      options: choices,
      initialValue: choices[cursor]?.value ?? "__submit__",
      submitHint: "edit/run"
    });
    if (selection === void 0) {
      throw new CliBackError("Back", { inputsState: { values, cursor } });
    }
    if (selection === "__back__") {
      throw new CliBackError("Back", { inputsState: { values, cursor } });
    }
    if (selection === "__settings__") {
      settingsExpanded = !settingsExpanded;
      const selectedIdx2 = choices.findIndex((choice) => choice.value === selection);
      if (selectedIdx2 !== -1) cursor = selectedIdx2;
      continue;
    }
    if (selection === "__submit__") {
      try {
        const validated = await coerceAndValidateInputs(definitions, values);
        return { values: validated, state: { values, cursor } };
      } catch (error) {
        validationError = error instanceof Error ? error.message : String(error);
        continue;
      }
    }
    validationError = void 0;
    const selectedIdx = choices.findIndex((choice) => choice.value === selection);
    if (selectedIdx !== -1) cursor = selectedIdx;
    const def = definitions.find((item) => item.name === selection);
    if (!def) throw new AppError(`Unknown input: ${selection}`);
    const currentValue = values[def.name] ?? "";
    values[def.name] = await editFlowInput(def, currentValue);
  }
}

// src/runtime/runner.ts
init_errors();

// src/runtime/input-state-store.ts
import { mkdir as mkdir4, readFile as readFile3, writeFile as writeFile5 } from "fs/promises";
import { createHash } from "crypto";
import { join as join5 } from "path";
var STATE_DIR = join5(process.env.TEMP ?? process.env.TMP ?? process.cwd(), "donumate", "input-state");
function keyFor(scriptPath) {
  return createHash("sha1").update(scriptPath).digest("hex");
}
function statePath(scriptPath) {
  return join5(STATE_DIR, `${keyFor(scriptPath)}.json`);
}
async function loadSavedInputState(scriptPath) {
  try {
    const raw = await readFile3(statePath(scriptPath), "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.values || typeof parsed.values !== "object") return void 0;
    return parsed.values;
  } catch {
    return void 0;
  }
}
async function saveInputState(scriptPath, values) {
  await mkdir4(STATE_DIR, { recursive: true });
  const payload = { values };
  await writeFile5(statePath(scriptPath), JSON.stringify(payload, null, 2), "utf8");
}

// src/runtime/runner.ts
function clearScreen() {
  process.stdout.write("\x1B[2J\x1B[H");
}
var PROFILE_LAUNCH_MAX_ATTEMPTS = 3;
var PROFILE_LAUNCH_RETRY_DELAY_MS = 1e4;
var FLOW_SCRIPT_SETTING_INPUTS = [
  {
    name: "hardless",
    type: "checkbox",
    lineNumber: 0,
    defaultValue: false
  },
  {
    name: "threads",
    type: "number",
    lineNumber: 0,
    defaultValue: 1
  },
  {
    name: "inputExcelFile",
    type: "inputExcelFile",
    lineNumber: 0,
    defaultValue: ""
  },
  {
    name: "mapProfileName",
    type: "checkbox",
    lineNumber: 0,
    defaultValue: false
  }
];
function withFlowScriptSettingInputs(definitions) {
  const injected = FLOW_SCRIPT_SETTING_INPUTS.filter((setting) => !definitions.some((input) => input.name === setting.name));
  return [...injected, ...definitions];
}
function flowHeadlessValue(inputs, fallback) {
  const value = inputs.hardless;
  return typeof value === "boolean" ? value : fallback;
}
function profileRuntimeInputs(profile, run) {
  return {
    profileID: run?.profile_id ?? profile.id,
    profileName: run?.name ?? profile.name,
    profileProxy: run?.proxy ?? ""
  };
}
async function runWorkflow(options) {
  const signal = options.signal;
  const donut = new DonutApiClient(options.apiBaseUrl, options.apiToken, signal);
  const log = (...args2) => logger.info(args2.join(" "));
  const workflow = await loadWorkflow(options.scriptSpec);
  let inputs;
  let args;
  let profile;
  let currentInputsState = options.initialInputsState;
  let currentProfileId = options.initialProfileId;
  if (!currentInputsState && workflow.kind === "flow") {
    currentInputsState = { values: await loadSavedInputState(options.scriptSpec) ?? {}, cursor: 0 };
  }
  if (options.profileId) {
    try {
      if (workflow.kind === "flow") {
        const flowInputs = withFlowScriptSettingInputs(workflow.program.inputs);
        const formResult = await runFlowInputForm(flowInputs, options.scriptInputs ?? {}, currentInputsState);
        inputs = formResult.values;
        currentInputsState = formResult.state;
        await saveInputState(options.scriptSpec, formResult.state.values).catch((error) => logger.error(formatError(error)));
      } else {
        inputs = {};
      }
    } catch (error) {
      if (isCliBackError(error)) {
        throw new CliBackError("Back", { inputsState: currentInputsState });
      }
      throw error;
    }
    args = stringifyInputValues(inputs);
    profile = await donut.getProfile(options.profileId);
  } else {
    while (true) {
      try {
        if (workflow.kind === "flow") {
          const flowInputs = withFlowScriptSettingInputs(workflow.program.inputs);
          const formResult = await runFlowInputForm(flowInputs, options.scriptInputs ?? {}, currentInputsState);
          inputs = formResult.values;
          currentInputsState = formResult.state;
          await saveInputState(options.scriptSpec, formResult.state.values).catch((error) => logger.error(formatError(error)));
        } else {
          inputs = {};
        }
      } catch (error) {
        if (isCliBackError(error)) {
          throw new CliBackError("Back", { inputsState: currentInputsState });
        }
        throw error;
      }
      args = stringifyInputValues(inputs);
      const profiles = await donut.listProfiles();
      try {
        profile = await selectCamoufoxProfile(profiles, currentProfileId);
        currentProfileId = profile.id;
      } catch (error) {
        if (isCliBackError(error)) {
          if (workflow.kind === "flow" && workflow.program.inputs.length > 0) {
            clearScreen();
            continue;
          }
          throw new CliBackError("Back", { inputsState: currentInputsState, profileId: currentProfileId });
        }
        throw error;
      }
      break;
    }
  }
  inputs = { ...inputs, ...profileRuntimeInputs(profile) };
  args = stringifyInputValues(inputs);
  clearScreen();
  logger.info(`  Profile: ${profile.name}`);
  const baseCtx = { profile, inputs, args, log, sleep: (ms) => sleep(ms, signal) };
  if (workflow.kind === "flow") {
    await executeFlowBlock(baseCtx, workflow.program, "beforeRunProfile");
  }
  const shouldLaunchProfile = workflow.kind !== "flow" || workflow.program.main.length > 0;
  let run;
  let bidi;
  let launched = false;
  let mainError;
  let afterKillError;
  try {
    if (shouldLaunchProfile) {
      const session = await launchProfileWithRetry({
        donut,
        cleanupDonut: new DonutApiClient(options.apiBaseUrl, options.apiToken),
        profileId: profile.id,
        headless: workflow.kind === "flow" ? flowHeadlessValue(inputs, false) : options.headless,
        bidiConnectTimeoutMs: options.bidiConnectTimeoutMs,
        bidiCommandTimeoutMs: options.bidiCommandTimeoutMs,
        signal
      });
      run = session.run;
      bidi = session.bidi;
      launched = true;
      inputs = { ...inputs, ...profileRuntimeInputs(profile, run) };
      args = stringifyInputValues(inputs);
      baseCtx.inputs = inputs;
      baseCtx.args = args;
      const page = session.page;
      const ctx = {
        ...baseCtx,
        run,
        page,
        bidi
      };
      clearScreen();
      if (workflow.kind === "flow") {
        await executeFlowBlock(ctx, workflow.program, "main");
      } else {
        await workflow.run(ctx);
      }
      logger.info("Done. Profile cleaned up.");
    } else {
      logger.info("  Running block empty, skip profile launch.");
    }
  } catch (error) {
    mainError = error;
  } finally {
    setCleaningUp(true);
    try {
      await bidi?.close().catch(() => {
      });
      if (launched) {
        const cleanupDonut = new DonutApiClient(options.apiBaseUrl, options.apiToken);
        await cleanupDonut.killProfile(profile.id).catch((error) => logger.error(formatError(error)));
      }
      if (workflow.kind === "flow") {
        try {
          await executeFlowBlock(baseCtx, workflow.program, "afterKillProfile");
        } catch (error) {
          afterKillError = error;
          logger.error(formatError(error));
        }
      }
      await workflow.cleanup().catch((error) => logger.error(formatError(error)));
    } finally {
      setCleaningUp(false);
    }
  }
  if (mainError) throw mainError;
  if (afterKillError) throw afterKillError;
}
async function launchProfileWithRetry(options) {
  let lastError;
  for (let attempt = 1; attempt <= PROFILE_LAUNCH_MAX_ATTEMPTS; attempt++) {
    let bidi;
    let didLaunch = false;
    try {
      logger.info(`  Launch profile attempt ${attempt}/${PROFILE_LAUNCH_MAX_ATTEMPTS}...`);
      const run = await options.donut.runProfile(options.profileId, {
        url: "about:blank",
        headless: options.headless
      });
      didLaunch = true;
      const readyProfile = await options.donut.waitForProfileReady(options.profileId, { timeoutMs: 3e4 });
      logger.info(`  Browser ready (pid=${readyProfile.process_id})`);
      const wsUrl = run.ws_url ?? `ws://127.0.0.1:${run.remote_debugging_port}/session`;
      bidi = new BidiClient(options.bidiConnectTimeoutMs, options.bidiCommandTimeoutMs, options.signal);
      await connectBidiWithRetry(bidi, wsUrl, options.signal);
      const page = new PageAutomation(bidi);
      await page.init();
      return { run, bidi, page };
    } catch (error) {
      lastError = error;
      await cleanupFailedLaunch(options.cleanupDonut, options.profileId, bidi, didLaunch);
      if (options.signal?.aborted || attempt === PROFILE_LAUNCH_MAX_ATTEMPTS) {
        throw error;
      }
      logger.info(`  Launch attempt ${attempt}/${PROFILE_LAUNCH_MAX_ATTEMPTS} failed, retrying in ${PROFILE_LAUNCH_RETRY_DELAY_MS}ms...`);
      await sleep(PROFILE_LAUNCH_RETRY_DELAY_MS, options.signal);
    }
  }
  throw lastError;
}
async function cleanupFailedLaunch(donut, profileId, bidi, didLaunch) {
  await bidi?.close().catch(() => {
  });
  if (didLaunch) {
    await donut.killProfile(profileId).catch((error) => logger.error(formatError(error)));
  }
}
async function connectBidiWithRetry(bidi, wsUrl, signal) {
  const maxRetries = 3;
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await bidi.connect(wsUrl);
      lastError = void 0;
      break;
    } catch (error) {
      lastError = error;
      if (signal?.aborted) break;
      if (attempt < maxRetries) {
        logger.info(`  BiDi attempt ${attempt}/${maxRetries} failed, retrying in 10s...`);
        await sleep(1e4, signal);
      }
    }
  }
  if (lastError) throw lastError;
}

// src/cli.ts
init_errors();

// package.json
var package_default = {
  name: "donumate",
  version: "0.1.0",
  description: "Standalone CLI for launching Donut Camoufox profiles and automating them over WebDriver BiDi.",
  type: "module",
  bin: {
    donumate: "./dist/cli.js"
  },
  scripts: {
    dev: "node --import tsx/esm src/cli.ts",
    start: "node --import tsx/esm src/cli.ts",
    build: "node build.mjs dev",
    "build:exe": "node build.mjs exe",
    "build:all": "node build.mjs all",
    "build:clean": "node build.mjs clean",
    "build:tsc": "tsc -p tsconfig.json",
    typecheck: "tsc -p tsconfig.json --noEmit"
  },
  pkg: {
    scripts: [
      "dist/cli.js"
    ],
    assets: [
      "node_modules/.pnpm/yoga-layout@3.2.1/node_modules/yoga-layout/dist/binaries/yoga-wasm-base64-esm.js"
    ],
    targets: [
      "node22-win-x64"
    ],
    outputPath: "release"
  },
  dependencies: {
    commander: "^13.1.0",
    dotenv: "^16.4.7",
    esbuild: "^0.28.1",
    ink: "^5.2.1",
    react: "^18.3.1",
    ws: "^8.18.0",
    xlsx: "^0.18.5",
    zod: "^3.24.2"
  },
  devDependencies: {
    "@types/node": "^22.13.4",
    "@types/react": "^18.3.31",
    "@types/ws": "^8.5.14",
    "cross-env": "^7.0.3",
    tsup: "^8.5.1",
    tsx: "^4.19.3",
    typescript: "^5.7.3"
  },
  engines: {
    node: ">=22"
  },
  packageManager: "pnpm@9.15.4"
};

// src/update/version.ts
var CURRENT_VERSION = package_default.version;
function normalizeVersion(version) {
  const cleaned = version.trim().replace(/^v/i, "");
  return /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(cleaned) ? cleaned : void 0;
}
function parseStableParts(version) {
  const normalized = normalizeVersion(version);
  if (!normalized) return void 0;
  const core = normalized.split(/[+-]/, 1)[0];
  const parts = core.split(".").map((part) => Number(part));
  if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part) || part < 0)) return void 0;
  return [parts[0], parts[1], parts[2]];
}
function isNewerVersion(latestVersion, currentVersion) {
  const latest = parseStableParts(latestVersion);
  const current = parseStableParts(currentVersion);
  if (!latest || !current) return false;
  for (let index = 0; index < latest.length; index += 1) {
    if (latest[index] > current[index]) return true;
    if (latest[index] < current[index]) return false;
  }
  return false;
}

// src/update/github-release.ts
var UPDATE_REPO_OWNER = "chiconghvan";
var UPDATE_REPO_NAME = "donumate";
var UPDATE_ASSET_PATTERN = /^donumate.*win.*x64.*\.exe$/i;
var LATEST_RELEASE_URL = `https://api.github.com/repos/${UPDATE_REPO_OWNER}/${UPDATE_REPO_NAME}/releases/latest`;
function isGitHubRelease(value) {
  if (!value || typeof value !== "object") return false;
  const release = value;
  return typeof release.tag_name === "string" && typeof release.html_url === "string" && Array.isArray(release.assets);
}
async function checkForUpdate(currentVersion) {
  let response;
  try {
    response = await fetch(LATEST_RELEASE_URL, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "donumate-update-check"
      }
    });
  } catch {
    return void 0;
  }
  if (!response.ok) return void 0;
  let payload;
  try {
    payload = await response.json();
  } catch {
    return void 0;
  }
  if (!isGitHubRelease(payload)) return void 0;
  const latestVersion = normalizeVersion(payload.tag_name);
  if (!latestVersion || !isNewerVersion(latestVersion, currentVersion)) return void 0;
  const asset = payload.assets.find((candidate) => UPDATE_ASSET_PATTERN.test(candidate.name));
  if (!asset) return void 0;
  return {
    currentVersion,
    latestVersion,
    releaseUrl: payload.html_url,
    assetName: asset.name,
    downloadUrl: asset.browser_download_url,
    size: asset.size
  };
}

// src/update/windows-self-update.ts
import { spawn as spawn2 } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir as mkdir5, stat as stat5, writeFile as writeFile6 } from "node:fs/promises";
import { tmpdir as tmpdir3 } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
function isPackagedWindowsExe() {
  return process.platform === "win32" && process.execPath.toLowerCase().endsWith(".exe") && !process.execPath.toLowerCase().endsWith("node.exe");
}
function escapeCmdValue(value) {
  return value.replace(/%/g, "%%").replace(/"/g, '""');
}
function buildUpdaterScript() {
  return `@echo off
setlocal
set "TARGET=%~1"
set "SOURCE=%~2"
shift
shift
set "ARGS="
:collect_args
if "%~1"=="" goto replace
set "ARGS=%ARGS% "%~1""
shift
goto collect_args
:replace
for /l %%i in (1,1,60) do (
  move /Y "%SOURCE%" "%TARGET%" >nul 2>&1
  if not errorlevel 1 goto relaunch
  timeout /t 1 /nobreak >nul
)
exit /b 1
:relaunch
start "" "%TARGET%" %ARGS%
(goto) 2>nul & del "%~f0"
`;
}
async function downloadFile(url, targetPath) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "donumate-updater"
    }
  });
  if (!response.ok || !response.body) {
    throw new Error(`Download failed (${response.status})`);
  }
  await pipeline(Readable.fromWeb(response.body), createWriteStream(targetPath));
}
async function installWindowsUpdate(update) {
  if (!isPackagedWindowsExe()) {
    return { started: false, message: "Update install skipped: not running as packaged Windows exe." };
  }
  const updateDir = path.join(tmpdir3(), "donumate-update");
  await mkdir5(updateDir, { recursive: true });
  const downloadedExePath = path.join(updateDir, `donumate-${update.latestVersion}-win-x64.exe`);
  const updaterCmdPath = path.join(updateDir, `donumate-update-${process.pid}.cmd`);
  await downloadFile(update.downloadUrl, downloadedExePath);
  const downloaded = await stat5(downloadedExePath);
  if (downloaded.size <= 0) throw new Error("Downloaded update is empty.");
  if (update.size > 0 && downloaded.size !== update.size) {
    throw new Error(`Downloaded update size mismatch. Expected ${update.size}, got ${downloaded.size}.`);
  }
  await writeFile6(updaterCmdPath, buildUpdaterScript(), "utf8");
  const args = process.argv.slice(1).map(escapeCmdValue);
  const child = spawn2("cmd.exe", ["/d", "/c", updaterCmdPath, process.execPath, downloadedExePath, ...args], {
    detached: true,
    stdio: "ignore",
    windowsHide: true
  });
  child.unref();
  return { started: true };
}

// src/update/index.ts
var updateCheckHasRun = false;
async function maybeRunUpdateCheck({ currentVersion, updateCheck = true }) {
  if (!updateCheck || updateCheckHasRun) return;
  updateCheckHasRun = true;
  const update = await checkForUpdate(currentVersion);
  if (!update) return;
  const ui = await getUi();
  const choice = await ui.runUpdatePrompt(update);
  if (choice !== "install") return;
  try {
    const result = await installWindowsUpdate(update);
    if (!result.started) {
      if (result.message) console.log(result.message);
      return;
    }
    console.log("Update installer started. Donumate will restart now.");
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Update failed: ${message}`);
  }
}

// src/cli.ts
var program2 = new Command();
program2.name("donumate").description("Launch Donut Camoufox profiles and automate them over WebDriver BiDi").version(CURRENT_VERSION);
function collectInput(value, previous) {
  return [...previous, value];
}
function parseInputOverrides(values) {
  const overrides = {};
  for (const value of values ?? []) {
    const separator = value.indexOf("=");
    if (separator <= 0) throw new Error(`Invalid --input value "${value}". Expected key=value.`);
    overrides[value.slice(0, separator)] = value.slice(separator + 1);
  }
  return overrides;
}
async function selectRootAction() {
  const ui = await getUi();
  return ui.runListPicker({
    title: "Donumate",
    options: [
      { label: "Run Scripts", value: "run-scripts" },
      { label: "Create flow script", value: "create-flow" },
      { label: "Exit", value: "exit" }
    ],
    cancelHint: "exit"
  });
}
function addCommonOptions(cmd) {
  return cmd.option("--api <url>", "Donut API base URL (default: http://127.0.0.1:10108)").option("--token <token>", "Donut API bearer token").option("--profile <profile-id>", "Skip interactive profile selection").option("--headless", "Launch profile headless").option("--connect-timeout <ms>", "BiDi connect timeout in ms (default: 30000)").option("--command-timeout <ms>", "BiDi command timeout in ms (default: 15000)").option("--input <key=value>", "Set .flow input; repeat for multiple (e.g. --input url=https://x --input count=5)", collectInput, []).option("--no-update-check", "Skip checking GitHub releases for updates");
}
initAbortHandler();
async function runWithOptions(options, scriptSpec) {
  const config = loadConfig({
    api: options.api,
    token: options.token,
    profile: options.profile,
    headless: options.headless,
    connectTimeout: options.connectTimeout,
    commandTimeout: options.commandTimeout
  });
  await maybeRunUpdateCheck({ currentVersion: CURRENT_VERSION, updateCheck: options.updateCheck });
  const fixedScript = scriptSpec ?? options.script;
  let lastSelectedScript = void 0;
  let savedInputsState = void 0;
  let lastSelectedProfileId = void 0;
  while (true) {
    let selectedScript;
    try {
      if (fixedScript) {
        selectedScript = fixedScript;
      } else {
        const rootAction = await selectRootAction();
        if (rootAction === void 0 || rootAction === "exit") return;
        if (rootAction === "create-flow") {
          const createdScript = await createFlowScript();
          if (createdScript) console.log(`Created ${createdScript}`);
          continue;
        }
        selectedScript = await selectScript(lastSelectedScript);
      }
      lastSelectedScript = selectedScript;
    } catch (error) {
      if (error instanceof AppError && error.message === "Exit") {
        return;
      }
      throw error;
    }
    const runnerOptions = {
      apiBaseUrl: config.apiBaseUrl,
      apiToken: config.apiToken,
      profileId: config.profileId,
      headless: config.headless,
      bidiConnectTimeoutMs: config.bidiConnectTimeoutMs,
      bidiCommandTimeoutMs: config.bidiCommandTimeoutMs,
      scriptSpec: selectedScript,
      scriptInputs: parseInputOverrides(options.input),
      signal: globalAbort.signal,
      initialInputsState: savedInputsState,
      initialProfileId: lastSelectedProfileId
    };
    try {
      await runWorkflow(runnerOptions);
      return;
    } catch (error) {
      if (isCliBackError(error)) {
        const backErr = error;
        if (backErr.state?.inputsState) {
          savedInputsState = backErr.state.inputsState;
        }
        if (backErr.state?.profileId) {
          lastSelectedProfileId = backErr.state.profileId;
        }
        if (!fixedScript) {
          continue;
        }
      }
      throw error;
    }
  }
}
async function handleAction(options, scriptSpec) {
  try {
    await runWithOptions(options, scriptSpec);
  } catch (error) {
    if (isCliBackError(error)) return;
    if (globalAbort.signal.aborted) {
      process.exitCode = 130;
      return;
    }
    console.error(formatError(error));
    console.error("elifecycle command failed with exit code 1");
    process.exitCode = 1;
  }
}
async function handleCheckAction(options) {
  const script = options.script;
  if (!script) throw new AppError("--script is required.");
  const fs = await import("fs/promises");
  const source = await fs.readFile(script, "utf8");
  const result = checkFlowSource(source, script);
  for (const diagnostic of result.diagnostics) {
    console.error(formatFlowDiagnostic(diagnostic, source));
  }
  const errorCount = result.diagnostics.filter((item) => item.severity === "error").length;
  const warningCount = result.diagnostics.filter((item) => item.severity === "warning").length;
  if (errorCount === 0 && warningCount === 0) {
    console.log("Check complete. No failures found.");
  } else {
    console.log(`Check complete. ${errorCount} error(s), ${warningCount} warning(s).`);
  }
  process.exitCode = errorCount > 0 ? 1 : 0;
}
addCommonOptions(program2).action((options) => handleAction(options));
addCommonOptions(
  program2.command("run").description("Run a workflow script against a Camoufox profile").option("--script <path-or-name>", "Script path or built-in name (e.g. threads, ./scripts/my-task.ts)")
).action((options) => handleAction(options));
addCommonOptions(
  program2.command("threads").description("Built-in Threads workflow")
).action((options) => handleAction(options, "threads"));
program2.command("check").description("Check a .flow script without launching browser").requiredOption("--script <path>", "Flow script path").action((options) => handleCheckAction(options));
program2.parseAsync();
