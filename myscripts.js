//Submits the search form if enter key is pressed
document.onkeyup = enter;
function enter(e){
  if(e.which == 13)
	submit();
	else e.preventDefault
/*  $('#myModal').on('shown.bs.modal', function () {
    $('#myInput').trigger('focus')
  })*/
}

window.onload = function(){
  input = document.getElementById("sCode");
  input.value = "S2454554"

  //Set the legend colors
  document.getElementById("label1").style.background = PURPLE_COLOR[0];
  document.getElementById("label2").style.background = GREY_COLOR[0];
  document.getElementById("label3").style.background = BLUE_COLOR[0];
  document.getElementById("label4").style.background = ORANGE_COLOR[0];
  document.getElementById("label5").style.background = GREEN_COLOR[0];
}


var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
function showModal(modalContent) {
  document.getElementById("myModal").style.display = "block"
 document.getElementById("modalInnerHtml").innerHTML = modalContent
}

function closeModal(){

    document.getElementById("myModal").style.display = "none"
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if(event.target.id == "myModal"){
    document.getElementById("myModal").style.display = "none";
  }
}


//Objects to hold all the nodes and edges for the vis.js dataset
var nodes;
var edges;

//Deterimins nodes sizes on the graph
const LARGE_NODE_SIZE = 24;
const DOC_NODE_SIZE = 6;
const REGULAR_NODE_SIZE = 16;
const SELECTED_DOC_NODE_SIZE = 40;
const LARGE_DOC_NODE_SIZE = 20;
const EDGE_COLOR = '#626161';
const EDGE_HIGHLIGHT = 'black';
const STD_DESCRIPTION_LENGTH = 120;
const STD_LINE_HEIGHT = 1.2;
const DOCS_LINE_HEIGHT = 1.2;
const SELECTED_NODE_COLOR = '#3F3D3D'
const BLANK_NODE_LABEL = "          "

//node and standards table colors. First entry is regular color, second value is matching border highlight color
const PURPLE_COLOR = ["#EFB2F2", "#EA39F0", "#F086F3", "#F2CFF3" ];
const GREY_COLOR = ['lightGrey',"#808080", "#C0C0C0"];
const BLUE_COLOR =   ["#9FBDE4", "#2B7BE4", "#679DE4", "#C2D0E4"];
const ORANGE_COLOR = ["#FBC08C","#F67401","#FB9032", "#FBCFAB"];
const GREEN_COLOR =  ["#CDE49F", "#85C702","#A7E42E", "#D8E4C2"];
const DOCS_COLOR = "#DFD4C8";
const COLOR_INDEX = 2;

var currentSelectedNode = 'S2454554';
var selectedDocNodeId = null;
var currentTableRow = "";
var currentDocsTableRow = null;
var rawMapData = null;
var nw = null;

function submit(){
  submit2();
  var currentValue =  document.getElementById('sCode').value;
  currentSelectedNode = currentValue;
  var networkDepth = document.getElementById('networkDepth').value;
  document.getElementById("currentNodeScode").value = currentValue;
	ClearTable(document.getElementById('t1'));
	var req = new XMLHttpRequest();
	var url = "server.php";
	var params = "scode=" + document.getElementById('sCode').value + "&networkDepth=" + networkDepth;

	req.open("POST", url, true);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	req.onload = function(){
		if(req.status == 200){
      var t0 = performance.now();
      rawMapData = req.responseText;
      console.log(JSON.parse(req.responseText))
			CreateMap();
      BuildAlignedDocumentsTable(currentValue);
      var t1 = performance.now();
			CreateTable(req.responseText);
		}
	}
	req.send(params);
}


function submit2(){
  var currentValue =  document.getElementById('sCode').value;
  currentSelectedNode = currentValue;
  var networkDepth = document.getElementById('networkDepth').value;
  document.getElementById("currentNodeScode").value = currentValue;
	ClearTable(document.getElementById('t1'));
	var req = new XMLHttpRequest();
	var url = "server.php";
	var params = "scode=" + document.getElementById('sCode').value + "&networkDepth=" + networkDepth;

	req.open("POST", url, true);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	req.onload = function(){
		if(req.status == 200){
      console.log(JSON.parse(req.responseText))
		}
	}
	req.send(params);
}

//Changes the display of the network from sCode to pCode and vice versa
function displayToggle(){

  var ASNToNGSS = true;
  if(document.getElementById("displayType").value == 1) ASNToNGSS = false;
  //get node and network data
  var rawNetwork= JSON.parse(rawMapData);
  var networkSize = rawNetwork[0].length;

  //For every node, update its label
  var nodesList = nodes.get(nodes._data);
  for(i = 0; i < networkSize; i++){
    var curNodeId = rawNetwork[0][i].id
      if(curNodeId < 10000){

        //Going from ASN to NGSS
        if(ASNToNGSS){
          if(rawNetwork[0][i].nodeType == "Performance Expectation" || rawNetwork[0][i].nodeType == "Standard"){
            nodes.update([{
              id:curNodeId,
              label:rawNetwork[0][i].NGSSCode
            }]);
          }
          else{
            nodes.update([{
              id:curNodeId,
              label:BLANK_NODE_LABEL
            }]);
          }
        }
        //Going from NGSS to ASN
        else{
          nodes.update([{
            id:curNodeId,
            label:rawNetwork[0][i].sCode
          }]);
        }
      }
  }
}


function checkBoxSubmit(){
  var legend = document.getElementById("theLegend");
  var docsLabel = document.getElementById("alignedDocsLabel");
  if(document.getElementById("myCheckBox").checked){
    if(legend){
     legend.style.top = "74vh"
    }
    docsLabel.style.display = "inline";
  }
  else {
    if(legend){
     legend.style.top = "76vh"
    }
    docsLabel.style.display = "none";
  }
  sCode = document.getElementById("currentNodeScode").value;
  currentSelectedNode = sCode;
  SubmitTableClick(sCode);
}

//Create the Standards table
function CreateTable(network){
	var tableRef = document.getElementById('t1').getElementsByTagName('tbody')[0];

  var setBorder = true;
	  for(i = 0; i < network[0].length - 1; i++){
       if(network[0][i].nodeType != "Document")
        if(setBorder){
           _InsertRow(tableRef, network[0][i].des, network[0][i].sCode, network[0][i].NGSSCode, network[0][i].gradeBand, network[0][i].color, network[0][i].id, setBorder);
        }
        else{
           _InsertRow(tableRef, network[0][i].des, network[0][i].sCode, network[0][i].NGSSCode, network[0][i].gradeBand, network[0][i].color, network[0][i].id, setBorder);
        }
        setBorder = false;
    }
}


//Performs a ajax post to get the aligned documents. Then it builds them into a tabel.
function BuildAlignedDocumentsTable(sCode){
  var req = new XMLHttpRequest();
  var url = "getAlignmentsAPI.php";
  var params = "scode=" + sCode;
  req.open("POST", url, true);
  req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  req.onload = function(){
    if(req.status == 200){
      //console.log(JSON.parse(req.responseText));
      _CreateDocumentsTable(sCode, JSON.parse(req.responseText));
    }
  }
  req.send(params);
}


function _CreateDocumentsTable(sCode, documents){
    var tableRef = document.getElementById('t2');
    ClearTable(tableRef);
    for(var i = 0; i < documents.length; i++){

      var curDocId = documents[i].doc_id
      var curNodeId = _GetDocNodeId(documents[i].doc_id);
/*      console.log(curNodeId);*/
      var newRow = tableRef.insertRow(tableRef.rows.length);
      newRow.id = documents[i].doc_id;
      newRow.style.background = DOCS_COLOR;

      //Add closure to onclick event since inside a loop
      newRow.onclick = (function(){
        var currentDoc = curDocId
        var currentId = curNodeId;
        return function(){
        var showAligned = document.getElementById("myCheckBox").checked;
        HighlightDocsTableCell(currentDoc);
        if(showAligned){
            HighlightDocumentNode(currentId);
        }
         }
      })();

      newRow.innerHTML =
      '<span style ="color:blue; cursor: pointer; letterSpacing:20px" onclick = GoToTEPage(\'' + documents[i].url + '\')>' +documents[i].title + '</span>'  + '<br>'
      + '<span>' + _TruncateDocDescription(documents[i].summary, documents[i].doc_id) + '</span>'
      +'<hr style= margin:3px>'
    }
}


function _GetDocNodeId(docNodeId){
   var data = JSON.parse(rawMapData);
   for(i = 0; i < data[0].length; i++){
     if(data[0][i].nodeType == "Document" && data[0][i].document == docNodeId){
       return data[0][i].id;
     }
   }
   return null;
  /*  for(var i = 0; i < nodesList.length; i++){
    /*  if(nodeList)*/
      //console.log(nodesList[i])
    /*}*/
/*  for(var i = 0; i < nodesList.length; i++){
    if(nodesList[i].sCode == currentSelectedNode){  //get the selected parent of the clicked document node
      parentId = nodesList[i].id;
    }
  }*/
}

function GoToTEPage(url){
  var win = window.open(url, '_blank');
  win.focus();
}


function _TruncateDocDescription(des, id){
  des = des.substring(0, des.length);
  if (des.length > 100){
    var newId = id.toString();
      return "<span 'style= display:inline'> " + des.substring(0, 100) +
      "<span style = 'display:inline' id = " + newId + '-elipsis' +">" +'...' +
      "</span>" + "</span>" + "<span id = " + newId + '-doc' +" style = 'display:none'>" + des.substring(100, des.length) +
      "<span style = 'color:blue; cursor: pointer'  id = " + newId + '-less' + ' onclick = _showLessDocDescription(\'' + newId + '\')>' +' less'+ "</span>" +
      "</span>" + '<span  onclick = "_ShowFullDocDescription(\'' + newId + '\')">  <span  style = "color:blue; cursor: pointer" id = \'' + newId + "-more" +'\' > more</span></span>';
  }
  else {
    return des + '.';
  }
}


function _ShowFullDocDescription(id){
  var doc = document.getElementById(id + "-doc");
  doc.style.display = "inline"
  var e = document.getElementById(id + "-elipsis");
  e.style.display = "none";
  var e = document.getElementById(id + "-less");
  e.style.display = "inline";
  var m = document.getElementById(id + "-more");
  m.style.display = "none";
}


function _showLessDocDescription(id){
     var doc = document.getElementById(id + "-doc");
     doc.style.display = "none";
     var e = document.getElementById(id + "-elipsis");
     e.style.display = "inline";
     var m = document.getElementById(id + "-more");
     m.style.display = "inline";
}


//Calls the api to get the ngss url for the standard. Then it loads the ngss page in a new window
/*function ViewNGSSPage(sCode){
  var uri = GetNGSSUrl(sCode);
  url = "https://www.nextgenscience.org/" + uri;
  var win = window.open(url, '_blank');
  win.focus();
}*/


//Calls the api to get the ngss url for viewing the standard with the given sCode
function ViewNGSSPage(sCode){
  var req = new XMLHttpRequest();
  var url = "GetNgssUrlAPI.php";
  var params = "scode=" + sCode;
  req.open("POST", url, true);
  req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  req.onload = function(){
    if(req.status == 200){
       var uri = JSON.parse(req.responseText);
      // if(uri == "error" || uri == null) return;
       url = "https://www.nextgenscience.org/" + uri;
       var win = window.open(url, '_blank');
       win.focus();
    }
  }
  req.send(params);
}


function _GetMatchingBorderColor(color, index){
  if(PURPLE_COLOR[index] == color) return PURPLE_COLOR[1];
  if(GREY_COLOR[index] == color) return GREY_COLOR[1];
  if(BLUE_COLOR[index] == color) return BLUE_COLOR[1];
  if(ORANGE_COLOR[index] == color) return ORANGE_COLOR[1];
  if(GREEN_COLOR[index] == color ) return GREEN_COLOR[1];
}


//Inserts a clickable row into the standards table.
function _InsertRow(tableRef, description, sCode, ngssCode,  gradeBand, color, id, setBorder){
	var newRow   = tableRef.insertRow(tableRef.rows.length);
	newRow.id = sCode
  newRow.style.backgroundColor = color;
  newRow.style.borderBottom= "1px solid #A0A0A0";
  //highlight the approprate border in the standards table.
  if(setBorder){
    currentTableRow = sCode;
     newRow.style.border = "4px solid " +  _GetMatchingBorderColor(color, 0);
  }
	newRow.onclick = function(){
		TableRowClickAction(sCode, color);
		HighlightNode(id)
    currentSelectedNode = sCode
    BuildAlignedDocumentsTable(sCode);
	};

  //Build the html for the table row
  var ul = "underline";
  var n = "none";
  var NGSSLink = '';
  if(color == GREY_COLOR[0] || color == PURPLE_COLOR[0]){
    NGSSLink =  '<span style="margin-right:3%">|</span>' + '<span style="">'
    + '<a class = "clickableTableCell" onclick=SubmitTableClick(\'' + sCode + '\'); style = "margin-right:2%; color:blue; cursor: pointer; font-size:10pt;">' + ngssCode + '</a>'
    + '<a onmouseover= this.style.textDecoration="underline" onmouseout=this.style.textDecoration="none"  onclick=ViewNGSSPage(\'' + sCode + '\') style="color:blue; cursor:pointer; hover:red">NGSS.org</a>'
    + '</span>' + '<br>';
  }
  newRow.innerHTML =
     '<a class = "clickableTableCell" onclick = SubmitTableClick(\'' + sCode + '\') style = "margin-right:2%; float:left; color:blue; cursor: pointer; font-size:10pt">' + sCode + '</a>'

     + '<a href=http://asn.jesandco.org/resources/'+sCode+' target="_blank" style="color:blue;margin-right:3% ">ASN.org</a>'
     +'<span style="">'
     + NGSSLink + FormatStdDescription(description, sCode, gradeBand) + ' </span>'
}


//Replaces the html of description to have a show hide feature if description is less than STD_DESCRIPTION_LENGTH
function FormatStdDescription(des, sCode, gradeBand){
  if(des.length < STD_DESCRIPTION_LENGTH) return des;
  var resultHTML = '<div style=line-height:' + STD_LINE_HEIGHT + ' >';
  var firstChunk = '('+gradeBand+')  ' + des.substring(0, STD_DESCRIPTION_LENGTH);
  var secondChunk = des.substring(STD_DESCRIPTION_LENGTH);
  resultHTML += firstChunk;
  resultHTML += '<span id = elipsis_' + sCode +'>...</span>'
  resultHTML += '<span style ="color:blue;cursor: pointer" id = more_'+ sCode +' onclick = showFullStdDescription(\'' + sCode + '\')> more </span>'
  resultHTML += '<span style="display:none" id = secondChunk_'+sCode+'>' + secondChunk + '</span>'
  resultHTML += '<span style = "display:none; color:blue;cursor: pointer" id = less_'+sCode+' onclick = showLessStdDescription(\'' + sCode + '\')> less</span>'
  resultHTML += '<div>'
  return resultHTML
}


function showFullStdDescription(sCode){
  document.getElementById("secondChunk_" + sCode).style.display = "inline";
  document.getElementById("less_" + sCode).style.display = "inline";
  document.getElementById("more_" + sCode).style.display = "none";
  document.getElementById("elipsis_" + sCode).style.display = "none";
}

function showLessStdDescription(sCode){
  document.getElementById("more_" + sCode).style.display = "inline";
  document.getElementById("elipsis_" + sCode).style.display = "inline";
  document.getElementById("less_" + sCode).style.display = "none";
  document.getElementById("secondChunk_" + sCode).style.display = "none";
}


//Highlighs the clicked row and the coorisponding node in the graph. Unhighlights everything else.
function TableRowClickAction(rowSCode, color){

	//Highligh the appropreate row with its color
	SetTableRowColor(document.getElementById('t1'), rowSCode, color)

  //unhighlight prev selected table cell if any
  if(document.getElementById(currentTableRow)){
      var curRow = document.getElementById(currentTableRow);
    curRow.style.border= "none";
    curRow.style.borderBottom = "1px solid #A0A0A0"
    curRow.style.borderTop = "1px solid #A0A0A0"
  }
  currentTableRow = rowSCode;

  //if function is called becuase text inside table is clicked.
 if(  document.getElementById(rowSCode) == null) return

  //highlight boder of clicked table row
 if(color == ORANGE_COLOR[0]){
      document.getElementById(rowSCode).style.border="4px solid " + ORANGE_COLOR[1];
  }
  else if(color==GREY_COLOR[0]){

      document.getElementById(rowSCode).style.border="4px solid " + GREY_COLOR[1];
  }
  else if(color==PURPLE_COLOR[0]){
      document.getElementById(rowSCode).style.border="4px solid " + PURPLE_COLOR[1];
  }
  else if(color==BLUE_COLOR[0]){

      document.getElementById(rowSCode).style.border="4px solid " + BLUE_COLOR[1];
  }
  else if(color==GREEN_COLOR[0]){

      document.getElementById(rowSCode).style.border="4px solid " + GREEN_COLOR[1];
  }
}


function FormatNodeDescriptionForPopup(des){
   var resultString = '<div style = "font-size:10pt">';
   var strPos = 0;
   var curLength = 0;
   while(strPos < des.length - 1){
     var curChar = des.charAt(strPos);
     strPos = strPos + 1;
     curLength = curLength + 1;
     resultString += curChar;
     if(curLength >= 40 && curChar == ' '){
       resultString += '</div>' + '<div style = "font-size:10pt">';
       curLength = 0;
     }
   }
    return resultString;
}


//Uses the network data form the post request to "server.php" and builds the vis.js network
function CreateMap(){
  var isChecked = document.getElementById("myCheckBox").checked;
  var displayType = document.getElementById("displayType").value;  //1 for ASN, 2 for NGSS
	//Create the network nodes
	var network = JSON.parse(rawMapData);
	var options = {};
  nodes = new vis.DataSet(options);
  for(i = 0; i < network[0].length; i++){
    if(network[0][i].nodeType != "Document"){
      var nodeLable = network[0][i].sCode;
      if(displayType == 2 && (network[0][i].nodeType == "Standard" || network[0][i].nodeType == "Performance Expectation")) nodeLable = network[0][i].NGSSCode
      else if (displayType == 2) nodeLable = BLANK_NODE_LABEL
      nodes.add({id:network[0][i].id, title: FormatNodeDescriptionForPopup(network[0][i].des), color:network[0][i].color, label:nodeLable, sCode:network[0][i].sCode, pCode:network[0][i].NGSSCode, font: {color:'black', size:REGULAR_NODE_SIZE}});
    }
    else if(i < 100 && isChecked == true) {
      nodes.add({id:network[0][i].id, color:network[0][i].color, docId:network[0][i].document, shape:'circle', width:.1, font:{size:6}, label:" " }); //widthConstraint:{minimum:DOC_NODE_SIZE, maximum:DOC_NODE_SIZE}});
    }
	}

  //Create the edge list
	var edgeOptions = {
		width:3
	};

	edges = new vis.DataSet(edgeOptions);
	for(i = 0; i < network[1].length; i++){
		edges.add({from:network[1][i].id1, to: network[1][i].id2, width:1.5, color: { color: EDGE_COLOR}})
	}

	var container = document.getElementById('mynetwork');

	// provide the data in the vis format
	var data = {
			nodes: nodes,
			edges: edges
	};
	var options = {
    interaction:{hover:true},
		 physics: false
	};

	nw = new vis.Network(container, data, options);

  HighlightNode(network[1][0].id1)//highlight the root node that was searched for

  //Pull all PEs towards the center to give the graph a nice curved shape
  var moveX = 30;
  var moveY = 30;
  for(var i = 0; i< 100; i++){
    if(network[0][i] && network[0][i].id< 1000  &&  network[0][i].nodeType == "Performance Expectation"){
        var oldX = nw.body.nodes[ network[0][i].id].x;
        var oldY = nw.body.nodes[ network[0][i].id].y;
        if(oldX > 0) oldX = oldX - moveX
        else oldX = oldX +  moveX
        if(oldY > 0) oldY = oldY - moveY
        else oldY = oldY + moveY
      nodes.update([{
       id: network[0][i].id,
       x: oldX,
       y:oldY
      }]);
    }
  }

	//Create table and register a click hanlder for each row clicked using the nw as a parameter
  CreateTable(network, nw)

/*  nw.on('beforeDrawing', function(properties){
    var nodesList = nodes.get(nodes._data);
    for(var i = 0; i < nodesList.length; i++){
             console.log(nodesList[i])
      if(nodesList[i].id >= 10000){
               console.log(nodesList[i])

      }
    }
  });*/
  nw.on('stabilized', function(properties){
  });
  //Register click handler for nodes
	nw.on( 'click', function(properties) {

		if(properties.nodes.length > 0 ){
			var ids = properties.nodes;
	    var clickedNodes = nodes.get(ids);
      if(clickedNodes[0].id <  10000){  //above 10000 are document nodes
	 		    var sCode = clickedNodes[0].sCode;
          var id = clickedNodes[0].id;
			    var nodesList = nodes.get(nodes._data);
			    HighlightNode(id);

          document.getElementById(sCode).style.border = "4px solid" +  _GetMatchingBorderColor(clickedNodes[0].color, 0);
          if(document.getElementById(currentTableRow)){
            document.getElementById(currentTableRow).style.border = "none";
          }
          currentTableRow = sCode;
			    SetTableRowColor(document.getElementById('t1'), sCode, clickedNodes[0].color);
          document.getElementById(sCode).style.border =  "4px solid " +  _GetMatchingBorderColor(BLUE_COLOR[1]);
          document.getElementById(sCode).scrollIntoView();
          BuildAlignedDocumentsTable(sCode);
          currentSelectedNode = sCode;
    }

    //if node clicked on was a document.
    else{
      HighlightDocumentNode(clickedNodes[0].id); //handle highlighting doc and unhighlighting other docs
      HighlightDocsTableCell(clickedNodes[0].docId) //handle docs table highlighting
    }

    document.getElementById("submitButton").scrollIntoView(); //make sure everything is in view after the table is rebuilt
    window.scrollTo(0,0);

		}
	});
/*  nw.on('hoverNode',function(params) { } );*/

  //Register double click handlers
	nw.on('doubleClick', function(properties){
		if(properties.nodes.length > 0){
			var ids = properties.nodes;
			var clickedNodes = nodes.get(ids);
      if(clickedNodes[0].nodeType != "Document"){
			var scode = clickedNodes[0].label;
			RemoveNetwork("mynetwork");
			ClearTable(document.getElementById('t1'));
			SubmitDoubleClick(scode)
    }
		 }
	});
}


function _HasNodeInNetwork(id){
    var nodesData = nodes.get(nodes._data);
      for(var i = 0; i < nodesData.length; i++){
        if(id == nodesData[i].id){
          return true;
        }
      }
    return false;
}

//Clears current table highlighing and adds the background color to the specified row
function SetTableRowColor(tableRef, sCode, color){
	 var rows = tableRef.rows;
	 tableRow = document.getElementById(sCode);
	if(tableRow){
    		tableRow.style.backgroundColor = color;
  }
}


function HighlightDocsTableCell(docId){
   //unighlight table row if set
   if(document.getElementById(currentDocsTableRow)){
     document.getElementById(currentDocsTableRow).style.border = "none"
   }

   if(document.getElementById(docId)){
      document.getElementById(docId).style.border = "4px solid grey";
   }

  // var tableRef = document.getElementById("t2");
   currentDocsTableRow = docId;
}


function HighlightDocumentNode(id){
    //get the id of the current selected node
    var parentId = null;
    var nodesList = nodes.get(nodes._data);
    for(var i = 0; i < nodesList.length; i++){
      if(nodesList[i].sCode == currentSelectedNode){  //get the selected parent of the clicked document node
        parentId = nodesList[i].id;
      }
    }
    var edgeData = edges.get(edges._data);
    for(i = 0; i < edgeData.length; i++){
            if(edgeData[i].from == id && edgeData[i].to == parentId){ //make clicked doc node selected if a child of selected PE
              nodes.update([{
              id:id,
              font:{size:SELECTED_DOC_NODE_SIZE},
              label:"    "
             }]);
              selectedDocNodeId = id;  //set the global value of the selected node
            }
            else if(edgeData[i].to == parentId && edgeData[i].from >= 10000 && selectedDocNodeId != null){ //unselect all other documents
              nodes.update([{
              id:edgeData[i].from,
              font:{size:LARGE_DOC_NODE_SIZE},
              label:"    "
             }]);
            }
        }

}


//Will highlight neihboring document nodes
function HighlightNbhDocumentNodes(id, size){
    var edgeData = edges.get(edges._data);
    //For each neighboring document node
   for(i = 0; i < edgeData.length; i++){
      if(edgeData[i].to == id && edgeData[i].from >= 10000 && edgeData[i].to < 10000 && edgeData[i].from < 10200){  //> 10000 is for documents
             if(_HasNodeInNetwork(edgeData[i].from)){
               nodes.update([{
               id:edgeData[i].from,
               font:{size:20},
               label:"    "
              }]);
             }
      }
    }
}


//Will un-highlight neighboring document nodes
function unHighlightNbhDocumentNodes(id, size){
  var edgeData = edges.get(edges._data);
  //For each neighboring document node
  for(i = 0; i < edgeData.length; i++){
    if(edgeData[i].to == id && edgeData[i].from > 10000 && edgeData[i].to < 10000 && edgeData[i].from < 11000){  //> 10000 is for documents
           if(_HasNodeInNetwork(edgeData[i].from)){
             nodes.update([{
             id:edgeData[i].from,
             width:.1,
             font:{size:6},
             label:" ",
             size:.1,
            }]);
           }
    }
  }
}

//Will unset all selected nodes and set the specified node to ge highlighted
function HighlightNode(id){
	var nodesList = nodes.get(nodes._data);
  var prevId = 1;
  for( var i = 0; i < nodesList.length; i++){
    if (nodesList[i].sCode == currentSelectedNode){
      prevId = nodesList[i].id
      next = nodesList[i].label
    }
  }
  nodes.update([{
  id:prevId,
  chosen:false,
  font: {
       strokeWidth:0,
       strokeColor:"black",
       size:REGULAR_NODE_SIZE,
  }
 }]);
 nodes.update([{
	id:id,
	font: {
		 strokeWidth:1,
		 strokeColor:  SELECTED_NODE_COLOR,
		 size:LARGE_NODE_SIZE,
     color:SELECTED_NODE_COLOR
	}
 }]);
 unHighlightNbhDocumentNodes(prevId, 5);
 HighlightNbhDocumentNodes(id, 20);
}


//removes all table rows exept the header from the DOM
function ClearTable(tableRef){
	var rows = tableRef.rows;
	  var i = rows.length;
	  while (--i) {
	    rows[i].parentNode.removeChild(rows[i]);
	  }
}


//Clears the canvas
function RemoveNetwork(domRef){

	var html = document.getElementById(domRef);
	while(html.firstChild){
	    html.removeChild(html.firstChild);
	}
}


//Handles the form submission when clicking on the link in the table
function SubmitTableClick(scode){
  document.getElementById("currentNodeScode").value = scode;
  currentSelectedNode = scode;
    var networkDepth = document.getElementById('networkDepth').value;
  BuildAlignedDocumentsTable(scode);
  RemoveNetwork("mynetwork");
  ClearTable(document.getElementById('t1'));
	var req = new XMLHttpRequest();
	var url = "server.php";
	var params = "scode=" + scode + "&networkDepth="+networkDepth;

	req.open("POST", url, true);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	req.onload = function(){
		if(req.status == 200){
				ClearTable(document.getElementById('t1'));
        rawMapData = req.responseText;
			  CreateMap();
        window.scrollTo(0,0)
		}
	}
	req.send(params);
}


//Handles form Submission when doubl clicking a node
function SubmitDoubleClick(scode){
  // document.getElementById("currentNodeScode").value = scode;
  var networkDepth = document.getElementById('networkDepth').value;
	var req = new XMLHttpRequest();
	var url = "server.php";
	var params = "scode=" + scode + "&networkDepth="+networkDepth;
	req.open("POST", url, true);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	req.onload = function(){
		if(req.status == 200){
      rawMapData = req.responseText;
			CreateMap();
      var nodesList = nodes.get(nodes._data);
      console.log(nodesList)
		//	CreateTable(req.responseText);
		}
	}
	req.send(params);
}


function GetDocumentMetadata(docId){
  var req = new XMLHttpRequest();
  var url = "GetDocumentDataAPI.php";
  var params = "docId=" + docId;

  req.open("POST", url, true);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  req.onload = function(){
    if(req.status == 200){
      response = JSON.parse(req.responseText);
      var modalContent = '<div style="width:90%;margin-left:5%;">' + '<a href='+response.TEURI+' style="font-size:12pt"><i>' +response.title+ '</i></a>'
      modalContent += '<div style = "font-size:14px">' + response.summary +  '</div>'
      showModal(modalContent)
    }
  }
  req.send(params);
}
