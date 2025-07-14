const extractJSON = (rawJson) => {
  return rawJson
    .replace(/\s*(while\((1|true)\)|for\(;;\))\s*;?/g, '')
    .replace(/^[^{[].*?\(\s*?{/, '{')
    .replace(/}\s*?\);?\s*$/, '}');
};

export default extractJSON;
