// Minimal LZString subset we need (URI-safe)
export const LZ = (() => {
  const f = String.fromCharCode;
  const keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
  const baseReverseDic: Record<string, Record<string, number>> = {};
  const getBaseValue = (alphabet: string, character: string) => {
    if (!baseReverseDic[alphabet]) {
      baseReverseDic[alphabet] = {};
      for (let i = 0; i < alphabet.length; i++) baseReverseDic[alphabet][alphabet.charAt(i)] = i;
    }
    return baseReverseDic[alphabet][character];
  };
  const compressToEncodedURIComponent = (input: string) => {
    if (input == null) return "";
    return _compress(input, 6, a => keyStrUriSafe.charAt(a));
  };
  const decompressFromEncodedURIComponent = (input: string | null) => {
    if (input == null) return "";
    if (input === "") return "";
    return _decompress(input.length, 32, index => getBaseValue(keyStrUriSafe, input.charAt(index)));
  };
  function _compress(uncompressed: string, bitsPerChar: number, getCharFromInt: (a:number)=>string) {
    if (uncompressed == null) return "";
    let i: number, value: number,
      context_dictionary: Record<string, number> = {},
      context_dictionaryToCreate: Record<string, boolean> = {},
      context_c = "", context_wc = "", context_w = "",
      context_enlargeIn = 2, context_dictSize = 3, context_numBits = 2,
      context_data: string[] = [], context_data_val = 0, context_data_position = 0;

    for (let ii = 0; ii < uncompressed.length; ii += 1) {
      context_c = uncompressed.charAt(ii);
      if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
        context_dictionary[context_c] = context_dictSize++;
        context_dictionaryToCreate[context_c] = true;
      }
      context_wc = context_w + context_c;
      if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
        context_w = context_wc;
      } else {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
          if (context_w.charCodeAt(0) < 256) {
            for (i = 0; i < context_numBits; i++) {
              context_data_val <<= 1;
              if (context_data_position == bitsPerChar-1) { context_data_position=0; context_data.push(getCharFromInt(context_data_val)); context_data_val=0; }
              else context_data_position++;
            }
            value = context_w.charCodeAt(0);
            for (i=0;i<8;i++){ context_data_val = (context_data_val<<1)|(value&1); if(context_data_position==bitsPerChar-1){context_data_position=0; context_data.push(getCharFromInt(context_data_val)); context_data_val=0;} else context_data_position++; value >>= 1;}
          } else {
            value = 1; for (i=0;i<context_numBits;i++){ context_data_val=(context_data_val<<1)|value; if(context_data_position==bitsPerChar-1){context_data_position=0; context_data.push(getCharFromInt(context_data_val)); context_data_val=0;} else context_data_position++; value=0; }
            value = context_w.charCodeAt(0);
            for (i=0;i<16;i++){ context_data_val=(context_data_val<<1)|(value&1); if(context_data_position==bitsPerChar-1){context_data_position=0; context_data.push(getCharFromInt(context_data_val)); context_data_val=0;} else context_data_position++; value>>=1;}
          }
          context_enlargeIn--; if (context_enlargeIn==0){context_enlargeIn=Math.pow(2,context_numBits); context_numBits++;}
          delete context_dictionaryToCreate[context_w];
        } else {
          value = context_dictionary[context_w];
          for (i=0;i<context_numBits;i++){ context_data_val=(context_data_val<<1)|(value&1); if(context_data_position==bitsPerChar-1){context_data_position=0; context_data.push(getCharFromInt(context_data_val)); context_data_val=0;} else context_data_position++; value>>=1;}
        }
        context_enlargeIn--; if(context_enlargeIn==0){context_enlargeIn=Math.pow(2,context_numBits); context_numBits++;}
        context_dictionary[context_wc] = context_dictSize++;
        context_w = String(context_c);
      }
    }
    if (context_w!=="") {
      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
        if (context_w.charCodeAt(0)<256) {
          for (i=0;i<context_numBits;i++){ context_data_val<<=1; if(context_data_position==bitsPerChar-1){context_data_position=0; context_data.push(getCharFromInt(context_data_val)); context_data_val=0;} else context_data_position++; }
          value = context_w.charCodeAt(0);
          for (i=0;i<8;i++){ context_data_val=(context_data_val<<1)|(value&1); if(context_data_position==bitsPerChar-1){context_data_position=0; context_data.push(getCharFromInt(context_data_val)); context_data_val=0;} else context_data_position++; value>>=1;}
        } else {
          value = 1; for (i=0;i<context_numBits;i++){ context_data_val=(context_data_val<<1)|value; if(context_data_position==bitsPerChar-1){context_data_position=0; context_data.push(getCharFromInt(context_data_val)); context_data_val=0;} else context_data_position++; value=0; }
          value = context_w.charCodeAt(0);
          for (i=0;i<16;i++){ context_data_val=(context_data_val<<1)|(value&1); if(context_data_position==bitsPerChar-1){context_data_position=0; context_data.push(getCharFromInt(context_data_val)); context_data_val=0;} else context_data_position++; value>>=1;}
        }
        context_enlargeIn--; if(context_enlargeIn==0){context_enlargeIn=Math.pow(2,context_numBits); context_numBits++;}
        delete context_dictionaryToCreate[context_w];
      } else {
        value = context_dictionary[context_w];
        for (i=0;i<context_numBits;i++){ context_data_val=(context_data_val<<1)|(value&1); if(context_data_position==bitsPerChar-1){context_data_position=0; context_data.push(getCharFromInt(context_data_val)); context_data_val=0;} else context_data_position++; value>>=1;}
      }
      context_enlargeIn--; if(context_enlargeIn==0){context_enlargeIn=Math.pow(2,context_numBits); context_numBits++;}
    }
    value = 2;
    for (i=0;i<context_numBits;i++){ context_data_val=(context_data_val<<1)|(value&1); if(context_data_position==bitsPerChar-1){context_data_position=0; context_data.push(getCharFromInt(context_data_val)); context_data_val=0;} else context_data_position++; value>>=1;}
    for(;;){ context_data_val<<=1; if(context_data_position==bitsPerChar-1){context_data.push(getCharFromInt(context_data_val)); break;} else context_data_position++; }
    return context_data.join('');
  }
  function _decompress(length:number, resetValue:number, getNextValue:(idx:number)=>number) {
    const dictionary:string[] = [];
    let next:number,enlargeIn=4, dictSize=4, numBits=3, entry="", result:string[] = [],
      i:number, w:string, bits:number, resb:number, maxpower:number, power:number,
      c = String.fromCharCode,
      data = {val:getNextValue(0), position:resetValue, index:1};

    for (i=0;i<3;i+=1) dictionary[i]=i.toString();

    bits=0; maxpower=Math.pow(2,2); power=1;
    while (power!=maxpower) { resb = data.val & data.position; data.position >>=1; if (data.position==0){data.position=resetValue; data.val=getNextValue(data.index++);} bits |= (resb>0?1:0) * power; power <<=1; }
    switch(bits){
      case 0:
        bits=0; maxpower=Math.pow(2,8); power=1;
        while (power!=maxpower){ resb=data.val&data.position; data.position>>=1; if(data.position==0){data.position=resetValue; data.val=getNextValue(data.index++);} bits |= (resb>0?1:0)*power; power<<=1; }
        w = c(bits); break;
      case 1:
        bits=0; maxpower=Math.pow(2,16); power=1;
        while (power!=maxpower){ resb=data.val&data.position; data.position>>=1; if(data.position==0){data.position=resetValue; data.val=getNextValue(data.index++);} bits |= (resb>0?1:0)*power; power<<=1; }
        w = c(bits); break;
      case 2: return "";
    }
    dictionary[3]=w; result.push(w);
    while(true){
      if(data.index>length) return "";
      bits=0; maxpower=Math.pow(2,numBits); power=1;
      while(power!=maxpower){ resb=data.val&data.position; data.position>>=1; if(data.position==0){data.position=resetValue; data.val=getNextValue(data.index++);} bits |= (resb>0?1:0)*power; power<<=1; }
      switch(next=bits){
        case 0:
          bits=0; maxpower=Math.pow(2,8); power=1;
          while(power!=maxpower){ resb=data.val&data.position; data.position>>=1; if(data.position==0){data.position=resetValue; data.val=getNextValue(data.index++);} bits |= (resb>0?1:0)*power; power<<=1; }
          dictionary[dictSize++] = c(bits); next = dictSize-1; enlargeIn--;
          break;
        case 1:
          bits=0; maxpower=Math.pow(2,16); power=1;
          while(power!=maxpower){ resb=data.val&data.position; data.position>>=1; if(data.position==0){data.position=resetValue; data.val=getNextValue(data.index++);} bits |= (resb>0?1:0)*power; power<<=1; }
          dictionary[dictSize++] = c(bits); next = dictSize-1; enlargeIn--;
          break;
        case 2: return result.join('');
      }
      if(enlargeIn==0){enlargeIn=Math.pow(2,numBits); numBits++; }
      let entryStr;
      if (dictionary[next]) entryStr = dictionary[next];
      else if (next === dictSize) entryStr = w + w.charAt(0);
      else return "";
      result.push(entryStr);
      dictionary[dictSize++] = w + entryStr.charAt(0);
      enlargeIn--; w = entryStr;
      if(enlargeIn==0){enlargeIn=Math.pow(2,numBits); numBits++; }
    }
  }
  return { compressToEncodedURIComponent, decompressFromEncodedURIComponent };
})();

