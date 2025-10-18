// Minimal LZString subset (URI-safe)
export const LZ = (() => {
  const keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
  const baseReverseDic = {};
  const getBaseValue = (alphabet, character) => {
    if (!baseReverseDic[alphabet]) {
      baseReverseDic[alphabet] = {};
      for (let i = 0; i < alphabet.length; i++) baseReverseDic[alphabet][alphabet.charAt(i)] = i;
    }
    return baseReverseDic[alphabet][character];
  };
  const compressToEncodedURIComponent = (input) => {
    if (input == null) return "";
    return _compress(input, 6, a => keyStrUriSafe.charAt(a));
  };
  const decompressFromEncodedURIComponent = (input) => {
    if (input == null) return "";
    if (input === "") return "";
    return _decompress(input.length, 32, index => getBaseValue(keyStrUriSafe, input.charAt(index)));
  };
  function _compress(uncompressed, bitsPerChar, getCharFromInt) {
    if (uncompressed == null) return "";
    let i, value,
      dict = {}, dictToCreate = {},
      c = "", wc = "", w = "",
      enlargeIn = 2, dictSize = 3, numBits = 2,
      data = [], data_val = 0, data_pos = 0;

    for (let ii = 0; ii < uncompressed.length; ii++) {
      c = uncompressed.charAt(ii);
      if (!Object.prototype.hasOwnProperty.call(dict, c)) {
        dict[c] = dictSize++; dictToCreate[c] = true;
      }
      wc = w + c;
      if (Object.prototype.hasOwnProperty.call(dict, wc)) {
        w = wc;
      } else {
        if (Object.prototype.hasOwnProperty.call(dictToCreate, w)) {
          if (w.charCodeAt(0) < 256) {
            for (i = 0; i < numBits; i++) { data_val <<= 1; if (data_pos == bitsPerChar-1) { data_pos=0; data.push(getCharFromInt(data_val)); data_val=0; } else data_pos++; }
            value = w.charCodeAt(0);
            for (i=0;i<8;i++){ data_val=(data_val<<1)|(value&1); if(data_pos==bitsPerChar-1){data_pos=0; data.push(getCharFromInt(data_val)); data_val=0;} else data_pos++; value>>=1; }
          } else {
            value = 1; for (i=0;i<numBits;i++){ data_val=(data_val<<1)|value; if(data_pos==bitsPerChar-1){data_pos=0; data.push(getCharFromInt(data_val)); data_val=0;} else data_pos++; value=0; }
            value = w.charCodeAt(0);
            for (i=0;i<16;i++){ data_val=(data_val<<1)|(value&1); if(data_pos==bitsPerChar-1){data_pos=0; data.push(getCharFromInt(data_val)); data_val=0;} else data_pos++; value>>=1; }
          }
          enlargeIn--; if (enlargeIn==0){enlargeIn=Math.pow(2,numBits); numBits++; }
          delete dictToCreate[w];
        } else {
          value = dict[w];
          for (i=0;i<numBits;i++){ data_val=(data_val<<1)|(value&1); if(data_pos==bitsPerChar-1){data_pos=0; data.push(getCharFromInt(data_val)); data_val=0;} else data_pos++; value>>=1; }
        }
        enlargeIn--; if(enlargeIn==0){enlargeIn=Math.pow(2,numBits); numBits++; }
        dict[wc] = dictSize++; w = String(c);
      }
    }
    if (w!=="") {
      if (Object.prototype.hasOwnProperty.call(dictToCreate, w)) {
        if (w.charCodeAt(0)<256) {
          for (i=0;i<numBits;i++){ data_val<<=1; if(data_pos==bitsPerChar-1){data_pos=0; data.push(getCharFromInt(data_val)); data_val=0;} else data_pos++; }
          value = w.charCodeAt(0);
          for (i=0;i<8;i++){ data_val=(data_val<<1)|(value&1); if(data_pos==bitsPerChar-1){data_pos=0; data.push(getCharFromInt(data_val)); data_val=0;} else data_pos++; value>>=1; }
        } else {
          value = 1; for (i=0;i<numBits;i++){ data_val=(data_val<<1)|value; if(data_pos==bitsPerChar-1){data_pos=0; data.push(getCharFromInt(data_val)); data_val=0;} else data_pos++; value=0; }
          value = w.charCodeAt(0);
          for (i=0;i<16;i++){ data_val=(data_val<<1)|(value&1); if(data_pos==bitsPerChar-1){data_pos=0; data.push(getCharFromInt(data_val)); data_val=0;} else data_pos++; value>>=1; }
        }
        enlargeIn--; if(enlargeIn==0){enlargeIn=Math.pow(2,numBits); numBits++; }
        delete dictToCreate[w];
      } else {
        value = dict[w];
        for (i=0;i<numBits;i++){ data_val=(data_val<<1)|(value&1); if(data_pos==bitsPerChar-1){data_pos=0; data.push(getCharFromInt(data_val)); data_val=0;} else data_pos++; value>>=1; }
      }
      enlargeIn--; if(enlargeIn==0){enlargeIn=Math.pow(2,numBits); numBits++; }
    }
    value = 2;
    for (i=0;i<numBits;i++){ data_val=(data_val<<1)|(value&1); if(data_pos==bitsPerChar-1){data_pos=0; data.push(getCharFromInt(data_val)); data_val=0;} else data_pos++; value>>=1; }
    for(;;){ data_val<<=1; if(data_pos==bitsPerChar-1){data.push(getCharFromInt(data_val)); break;} else data_pos++; }
    return data.join('');
  }
  function _decompress(length, resetValue, getNextValue) {
    const dictionary = [];
    let next, enlargeIn=4, dictSize=4, numBits=3, entry="", result = [],
      i, w, bits, resb, maxpower, power,
      c = String.fromCharCode,
      data = {val:getNextValue(0), position:resetValue, index:1};

    for (i=0;i<3;i++) dictionary[i]=i.toString();

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
