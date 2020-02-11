var DOC_ID = '13d2Y3Tv4YhONJ6tBm0IzNr65WPxD77qs_C2zfswJawc'; // Template File 
         
function hello() {  
  try {
    // next set where we write the data - you could write to multiple/alternate destinations
    var doc = SpreadsheetApp.openById(DOC_ID).copy('498_copy');
  } catch(e){
    // if error return this
    Logger.log(e);
    return {"status": JSON.stringify(e)};
  }
}