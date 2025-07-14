/*jslint white: true, devel: true, onevar: true, browser: true, undef: true, nomen: true, regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50, indent: 4 */
var jsl = typeof jsl === 'undefined' ? {} : jsl;

/**
 * jsl.format - Provide json reformatting in a character-by-character approach, so that even invalid JSON may be reformatted (to the best of its ability).
 *
**/
jsl.format = (function () {


    function getSizeOfArray(jsonString, startingPosition) {
        const chars = jsonString.slice(startingPosition + 1).split('');
        let inString = false;
        let escaped = false;
        let bracketCount = 1;

        const endIndex = chars.findIndex(char => {
            if (escaped) {
                escaped = false;
                return false;
            }

            if (char === '\\') {
                escaped = true;
                return false;
            }

            if (char === '"') {
                inString = !inString;
                return false;
            }

            if (!inString) {
                if (char === '[') {
                    bracketCount++;
                    return false;
                }
                if (char === ']') {
                    bracketCount--;
                    return bracketCount === 0;
                }
            }

            return false;
        });

        if (endIndex === -1) return null;

        try {
            const arraySlice = jsonString.slice(startingPosition, startingPosition + endIndex + 2);
            return JSON.parse(arraySlice).length;
        } catch {
            return null;
        }
    }

    function formatJson(json, options = {}) {
        const {
            tabSize = 2,
            indentCStyle = false,
            showArraySize = false
        } = options;

        const tab = ' '.repeat(tabSize);
        let indentLevel = 0;
        let inString = false;
        let escaped = false;

        const result = json.split('').map((char, index) => {
            const prevChar = index > 0 ? json[index - 1] : '';
            const prevPrevChar = index > 1 ? json[index - 2] : '';

            // Handle escape sequences
            if (escaped) {
                escaped = false;
                return char;
            }

            if (char === '\\') {
                escaped = true;
                return char;
            }

            // Handle quotes and string boundaries
            if (char === '"') {
                if (index === 0) {
                    inString = true;
                } else if (prevChar !== '\\' || (prevChar === '\\' && prevPrevChar === '\\')) {
                    inString = !inString;
                }
                return char;
            }

            // Handle formatting for non-string content
            if (!inString) {
                if (char === '{' || char === '[') {
                    const prefix = indentCStyle ? `\n${tab.repeat(indentLevel)}` : '';
                    const arraySize = char === '[' && showArraySize ?
                        (() => {
                            const size = getSizeOfArray(json, index);
                            return size !== null ? `Array[${size}]` : '';
                        })() : '';

                    indentLevel++;
                    return `${prefix}${arraySize}${char}\n${tab.repeat(indentLevel)}`;
                }

                if (char === '}' || char === ']') {
                    indentLevel--;
                    return `\n${tab.repeat(indentLevel)}${char}`;
                }

                if (char === ',') {
                    return `,\n${tab.repeat(indentLevel)}`;
                }

                if (char === ':') {
                    return ': ';
                }

                if ([' ', '\n', '\t'].includes(char)) {
                    return '';
                }
            }

            return char;
        }).join('');

        return result;
    }

    return { "formatJson": formatJson };

}());

export default jsl.format.formatJson;
