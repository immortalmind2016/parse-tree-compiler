
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

const str=s=>parseState=>{
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
}

const sequenceOf=parsers=>parserState=>{
    const results=[];
   if(parserState.isError){
       parserState
   }
    let nextState=parserState;
    for (let p of parsers){
        nextState=p(nextState)
        results.push(nextState.result);
    }
    return {
        ...nextState,
        result:results
    }
}

// parser=ParserState in -> Parser State out 
const run=(parser,targetString)=>{
    const initState={
        targetString,
        index:0,
        error:null,
        isError:0,
        result:null
    }
    return parser(initState)
}
//and how we use it 

const parser=str("hello")
const parser2=str("there")
const mainParser=sequenceOf([
    parser,
    parser2

])
console.log(
    run(mainParser,"")
)