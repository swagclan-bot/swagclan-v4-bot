import randomstring from "randomstring"

export default randomstring.generate({
    length: 15,
    charset: "hex",
    capitalization: "lowercase"
});