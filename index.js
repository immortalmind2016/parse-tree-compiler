const A=require("arcsecond")

const tag=type=>value=>({
    type,value
})
const subParser=  A.sequenceOf([ A.letters,
    A.digits
]).map(tag("letterDigits"))
const helloParser=A.choice([
    A.str("Hello"),
    A.str("world")
])
const stringParser2=A.str("hello").map(result =>({
    type:"Captured String",
    value:result
})

   
)

const stringParser3=A.sequenceOf([
 subParser
    ,
    A.str("hello").map(tag("String")),
    A.many(A.char(" ")).map(tag("space")).map(tag("whitespace")),
    A.str("world").map(tag("String")),
    A.endOfInput.map(tag("endOfInput"))
]).map(tag("ourTree"))
const stringParser=A.many(helloParser).map((resuluts)=>{

});


console.log(
    stringParser3.run("Mohamed422hello    world").result
    );