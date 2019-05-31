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

console.log(event.target.id)
if(event.target.id == "myModal"){
  document.getElementById("myModal").style.display = "none";
}
  //   document.getElementById("myModal").style.display = "none"
}


//Object to hold all the nodes for the vis.js dataset
var nodes;

//Deterimins nodes sizes on the graph
const LARGE_NODE_SIZE = 24;
const REGULAR_NODE_SIZE = 16;
const EDGE_COLOR = '#626161';
const EDGE_HIGHLIGHT = 'black';
const STD_DESCRIPTION_LENGTH = 120;
const STD_LINE_HEIGHT = 1.2;
const DOCS_LINE_HEIGHT = 1.2;
const SELECTED_NODE_COLOR = '#3F3D3D'


function submit(){
  var currentValue =  document.getElementById('sCode').value;
  var networkDepth = document.getElementById('networkDepth').value;
    console.log(networkDepth);
  document.getElementById("currentNodeScode").value = currentValue;
  BuildAlignedDocumentsTable(currentValue);
	ClearTable(document.getElementById('t1'));
	var req = new XMLHttpRequest();
	var url = "server.php";
	var params = "scode=" + document.getElementById('sCode').value + "&networkDepth=" + networkDepth;

	req.open("POST", url, true);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	req.onload = function(){
		if(req.status == 200){
      var t0 = performance.now();
			CreateMap(req.responseText);
      var t1 = performance.now();
			CreateTable(req.responseText);
      console.log("vis.js took " +(t1 - t0)/1000 + " seconds to build the network");
		}
	}
	req.send(params);
}


function checkBoxSubmit(){
  var docsLabel = document.getElementById("alignedDocsLabel");
  if(document.getElementById("myCheckBox").checked){
    docsLabel.style.display = "inline";
  }
  else {
    docsLabel.style.display = "none";
  }

  sCode = document.getElementById("currentNodeScode").value;
  SubmitTableClick(sCode);
}


//Create the Standards table
function CreateTable(network){

	var tableRef = document.getElementById('t1').getElementsByTagName('tbody')[0];

  var setColor = true;
	  for(i = 0; i < network[0].length - 1; i++){
       if(network[0][i].nodeType != "Document")
        if(setColor){
           _InsertRow(tableRef, network[0][i].des, network[0][i].sCode, network[0][i].gradeBand, network[0][i].color, network[0][i].id, setColor);
        }
        else{
           _InsertRow(tableRef, network[0][i].des, network[0][i].sCode, network[0][i].gradeBand, network[0][i].color, network[0][i].id, setColor);
        }
        setColor = false;

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

    document.getElementById("t2Title").innerHTML = "Aligned Documents";

    for(var i = 0; i < documents.length; i++){
      var newRow = tableRef.insertRow(tableRef.rows.length);
      newRow.id = documents[i].doc_id;
      newRow.style.background = documents[i].std_color;
      newRow.innerHTML =
      '<div style = "line-height:'+DOCS_LINE_HEIGHT+'">' + '</div>' +
      '<span style ="color:blue; cursor: pointer; letterSpacing:20px" onclick = GoToTEPage(\'' + documents[i].url + '\')>' +documents[i].doc_id + '</span>'  + '<br>'
      + '<span> <i>' + documents[i].title +  ' </i><span>' + '<br>'
      + '<span>' + _TruncateDocDescription(documents[i].summary, documents[i].doc_id) + '</span>' +
      '<hr style= margin:3px>'
    }
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
function ViewNGSSPage(sCode){
  var uri = GetNGSSUrl(sCode);
  alert(uri)
  url = "https://www.nextgenscience.org/" + uri;
  var win = window.open(url, '_blank');
  win.focus();
}


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

//Inserts a clickable row into the standards table.
function _InsertRow(tableRef, description, sCode, gradeBand, color, id, setColor){
	var newRow   = tableRef.insertRow(tableRef.rows.length);
	newRow.id = sCode
  if(setColor){
    newRow.style.backgroundColor = color;
  }
	newRow.onclick = function(){
		TableRowClickAction(sCode, color);
		HighlightNode(id)
    BuildAlignedDocumentsTable(sCode);
	};

  //Build the html for the table row
  newRow.innerHTML =
   '<a class = "clickableTableCell" onclick = SubmitTableClick(\'' + sCode + '\') style = "margin-right:3%; float:left; color:blue; cursor: pointer; font-size:10pt">' + sCode + '</a>'
  + '<span style = "float:left; margin-right:3%">' + '   ( ' + gradeBand + ' )   ' + '</span>'
  + '<a class = "clickableTableCell" onclick=ViewNGSSPage(\'' + sCode + '\'); style = "color:blue; cursor: pointer; font-size:10pt">' + "NGSS.org" + '</a>' + '<br>'
  + '<span>  ' + FormatStdDescription(description, sCode) + ' </span>'
  + '<hr style= margin:1px;>'
}


//Replaces the html of description to have a show hide feature if description is less than STD_DESCRIPTION_LENGTH
function FormatStdDescription(des, sCode){
  if(des.length < STD_DESCRIPTION_LENGTH) return des;

  var resultHTML = '<div style=line-height:' + STD_LINE_HEIGHT + ' >';
  var firstChunk = des.substring(0, STD_DESCRIPTION_LENGTH);
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
/*  e = e || window.event;
  e.preventDefault();
  console.log(e)*/
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
//FormatNodeDescriptionForPopup("This is a bunch of random text to display in the popup area when you hover over a node");


//Uses the network data form the post request to "server.php" and builds the vis.js network
function CreateMap(data){
  isChecked = document.getElementById("myCheckBox").checked;
	//Create the network nodes
	var network = JSON.parse(data);
  console.log(network);
	var options = {};
  nodes = new vis.DataSet(options);
  for(i = 0; i < network[0].length; i++){
    if(network[0][i].nodeType != "Document")

		nodes.add({id:network[0][i].id, title: FormatNodeDescriptionForPopup(network[0][i].des), color:network[0][i].color, label:network[0][i].sCode, font: {color:'black', size:REGULAR_NODE_SIZE}});
    else if(i < 100 && isChecked == true) {
      nodes.add({id:network[0][i].id, color:network[0][i].color, label:"Document", docId:network[0][i].document});
    }
	}

  //Create the edge list
	var edgeOptions = {
		color:'red',
		width:3
	};
	var edges = new vis.DataSet(edgeOptions);
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

	// initialize the network!
	var nw = new vis.Network(container, data, options);

	nodes.update([{
	 id: network[1][0].id1,
	 chosen:true,
	 font: {
		  strokeWidth:1,
      strokeColor:  SELECTED_NODE_COLOR,
      size:LARGE_NODE_SIZE,
      color:SELECTED_NODE_COLOR
	 }
	}]);

	//Create table and register a click hanlder for each row clicked using the nw as a parameter
  CreateTable(network, nw)


  //Register click handler for nodes
	nw.on( 'click', function(properties) {
		if(properties.nodes.length > 0 ){
			var ids = properties.nodes;
	    var clickedNodes = nodes.get(ids);
        console.log(clickedNodes);
      if(clickedNodes[0].label != "Document"){
			var scode = clickedNodes[0].label;
      var id = clickedNodes[0].id;
			var nodesList = nodes.get(nodes._data);
			HighlightNode(id);
			SetTableRowColor(document.getElementById('t1'), scode, clickedNodes[0].color);
      document.getElementById(scode).scrollIntoView();
      BuildAlignedDocumentsTable(scode);
    }
    else{
      //if document node was clicked. Calls show modal content
      GetDocumentMetadata(clickedNodes[0].docId)
    }

		}
	});
  nw.on('hoverNode',function(params) {
    console.log("test")

             }
            );
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

/*  nw.on('hoverNode', function(){
    console.log("hovering")
    alert("hovering");
  });*/
}


//Clears current table highlighing and adds the background color to the specified row
function SetTableRowColor(tableRef, sCode, color){

	 var rows = tableRef.rows;
	 for(i = 0; i < rows.length; i++){
			rows[i].style.backgroundColor = "white";
		}
	  tableRow = document.getElementById(sCode);
		if(tableRow)
		tableRow.style.backgroundColor = color;
}


//Will unset all selected nodes and set the specified node to ge highlighted
function HighlightNode(id){
	var nodesList = nodes.get(nodes._data);
  for( var i = 0; i < nodesList.length; i++){
	  nodes.update([{
		id:nodesList[i].id,
    chosen:false,
		font: {
		  	 strokeWidth:0,
		   	 strokeColor:"black",
			   size:REGULAR_NODE_SIZE,
		}
	 }]);
 }
 nodes.update([{
	id:id,

	font: {
		 strokeWidth:1,
		 strokeColor:  SELECTED_NODE_COLOR,
		 size:LARGE_NODE_SIZE,
     color:SELECTED_NODE_COLOR
	}
 }]);
}


//removes all table rows exept the header from the DOM
function ClearTable(tableRef){
	var rows = tableRef.rows;
	  var i = rows.length;
	  while (--i) {
	    rows[i].parentNode.removeChild(rows[i]);
	    // or
	    // table.deleteRow(i);
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
			  CreateMap(req.responseText);
        //	curRow.style.backgroundColor = network[0][0].color

		//	CreateTable(req.responseText);
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
			CreateMap(req.responseText);
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
      console.log(JSON.parse(req.responseText));
      var modalContent = '<div style="width:90%;margin-left:5%;">' + '<div><i>' +response.title+ '</i></div>'
      modalContent += '<div>' + response.summary +  '</div>'
      modalContent += '<a href=' +  response.TEURI+'>' + 'View On teachengineering.org' +  '</a>' + '</div>'

      showModal(modalContent)
    }
  }
  req.send(params);
}
