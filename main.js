

const lettersRegex=/^[a-zA-Z]+/
const digitsRegex=/^[0-9]+/
const mathOpRegex=/^(\+|-|\*|\/|=|>|<|>=|<=|&|\||%|!|\^|\(|\))$/


const str=s=>new Parser(parseState=>{
    const {
        targetString,
        index,
        isError
    }=parseState
    if(isError){
        return parseState
    }
    const slicedTarget=targetString.slice(index)
    if(slicedTarget.startsWith(s))  //Success
        return updateParserSate(parseState,index+s.length,s)
    else if(slicedTarget.length==0)
       return updateParserError(parseState,`Tried to match ${s}, but got unexpected end of input`)
    
    return updateParserError(parseState,`Tried to match ${s}, but got ${targetString.slice(index,10)}`)
})


const updateParserSate=(state,index,result)=>({//function to update State
    ...state,
    index,
    result


})


const updateParserError=(state,errorMsg)=>({//function to update State
    ...state,
    isError:true,
    error:errorMsg


})


const updateParserResult=(state,result)=>({//function to update State
    ...state,

    result


})


class Parser{
    constructor(parserStateTransformerFn){
        this.parserStateTransformerFn=parserStateTransformerFn
    }
    run(targetString){
        const initState={
            targetString,
            index:0,
            error:null,
            isError:0,
            result:null
        }
        return this.parserStateTransformerFn(initState)
    }
    map(fn) {
        return new Parser(parserState => {
          const nextState = this.parserStateTransformerFn(parserState);
    
          if (nextState.isError) return nextState;
    
          return updateParserResult(nextState, fn(nextState.result));
        });
      }
    errorMap(fn){
        return new Parser(parserState=>{
              const nextState=this.parserStateTransformerFn(parserState)
              if(nextState.isError)
              return nextState
         
              return updateParserError(nextState,fn(nextState.error,nextState.index)) // fn is our callback then the returned value from map will be input to updateResult
          })
      }
    //Chain is like map
    // letters.chain(result=>{})
    chain(fn) {
        return new Parser(parserState => {
          const nextState = this.parserStateTransformerFn(parserState);
    
          if (nextState.isError) return nextState;
    
          const nextParser = fn(nextState.result);
    
          return nextParser.parserStateTransformerFn(nextState);
        });
      }

}



const letters=new Parser(parseState=>{
    const {
        targetString,
        index,
        isError
    }=parseState
    if(isError){
        return parseState
    }
    const slicedTarget=targetString.slice(index)
    const regexMatch=slicedTarget.match(lettersRegex)
    if(regexMatch)  //Success
        return updateParserSate(parseState,index+regexMatch[0].length,regexMatch[0])
    if(slicedTarget.length==0)
       return updateParserError(parseState,`Tried to match letters, but got unexpected end of input`)
  
    return updateParserError(parseState,`
    'letters: Couldn't match letters at {index}'
    `)
})

const mathOp=new Parser(parseState=>{
    const {
        targetString,
        index,
        isError
    }=parseState
    if(isError){
        return parseState
    }
    const slicedTarget=targetString.slice(index)
    const regexMatch=slicedTarget.match(mathOpRegex)
    console.log(regexMatch , slicedTarget)
    if(regexMatch)  //Success
        return updateParserSate(parseState,index+regexMatch[0].length,regexMatch[0])
    if(slicedTarget.length==0)
       return updateParserError(parseState,`Tried to match letters, but got unexpected end of input`)
  
    return updateParserError(parseState,`
    'operations: Couldn't match operations at ${index}'
    `)
})

const digits=new Parser(parseState=>{
    const {
        targetString,
        index,
        isError
    }=parseState
    if(isError){
        return parseState
    }
    const slicedTarget=targetString.slice(index)
    const regexMatch=slicedTarget.match(digitsRegex)
    if(regexMatch)  //Success
        return updateParserSate(parseState,index+regexMatch[0].length,regexMatch[0])
    if(slicedTarget.length==0)
       return updateParserError(parseState,`Tried to match letters, but got unexpected end of input`)
  
    return updateParserError(parseState,`
    'digits: Couldn't match digits at {index}'
    `)
})


const sequenceOf = parsers => new Parser(parserState => {
    if (parserState.isError) {
      return parserState;
    }
  
    const results = [];
    let nextState = parserState;
  
    for (let p of parsers) {
      nextState = p.parserStateTransformerFn(nextState);
      results.push(nextState.result);
    }
  
    return updateParserResult(nextState, results);
  })
const choice=parsers=>new Parser(parserState=>{
    const results=[];
 
    let nextState=parserState;
    for (let p of parsers){
        nextState=p.parserStateTransformerFn(parserState)
        if(!parserState.isError){
            return nextState;
          }
    }
    return updateParserResult(nextState,results)
})

const emptyOrExist=parser=>new Parser(parserState=>{
    const results=[];
 
    let nextState=parserState;
    nextState=parser.parserStateTransformerFn(nextState)
    if(nextState.isError){
        return parserState
    }
    return updateParserResult(nextState,results)
})

const many = parser => new Parser(parserState => {
    if (parserState.isError) {
      return parserState;
    }
  
    let nextState = parserState;
    const results = [];
    let done = false;
  
    while (!done) {
      let testState = parser.parserStateTransformerFn(nextState);
  
      if (!testState.isError) {
        results.push(testState.result);
        nextState = testState;
      } else {
        done = true;
      }
    }
  
    return updateParserResult(nextState, results);
  });

const between=(leftParser,rightParser)=>contentParser=>sequenceOf([
    leftParser,
    contentParser,
    rightParser
]).map(results=>results[1])

// parser=ParserState in -> Parser State out 

//and how we use it 

const parser=str("hello").map((result)=>{
    return result+"HH"
}).errorMap((msg,index)=>{
    return msg+"NO"
})
const parser2=str("there")

const letParser=letters
const digParser=digits
const mainParser=sequenceOf(
[
    letParser,
    digParser
]
    
    
)
//examples needed
//"number:42"
//"String:hello"
const stringParser=sequenceOf([
    letters
    
]).map(([number,_,s])=>({
    type:"String",
    value:[number]
}))

/*
const newParser=sequenceOf([sequenceOf([letters,str(" ")])])
.map(results=>results[0][0])
.chain(type=>{
    console.log(type)
    if(type=="String"){
        return stringParser
    }
    return stringParser
})
console.log(newParser.run("String mohamed"))
*/
const betweenBrackets=between(str("("),str(")"))
const parserr=betweenBrackets(sequenceOf([
    letters,
    str("=="),
    digits
]))


const betweenBrackets1=between(str("{"),str("}"))
const parserr1=betweenBrackets1(sequenceOf([
    letters,
    str("="),
    letters,
    str("+"),
    digits
   
]))







const ifcond=sequenceOf([
    str("if"),
    parserr,
    parserr1,
    emptyOrExist(
        many(sequenceOf([
            str("elseif"),
            parserr,
            parserr1,
           
        ]))
       
    ),
    emptyOrExist(
        sequenceOf([
            str("else"),
            parserr1
        ])
       
    )
])

const util=require("util")
console.log(
util.inspect(ifcond.run("if(x==5){x=x+5}elseif(x==3){x=x+3}elseif(x==1){x=x+1}else{x=x+6}"),{showHidden: false,depth:null})
)


