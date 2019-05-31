alert("test")
function submit(){
	console.log("hwerhsdfsdksdhfksdfkshdkjfsdfjfhksdfhkj")
	var req = new XMLHttpRequest();
	var url = "server.php";
	var params = "scode=" + document.getElementById('sCode').value;

	req.open("POST", url, true);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	req.onload = function(){
		if(req.status == 200){
			console.log(JSON.parse(req.responseText));
			BuildMap(req.responseText);
		}
	}

	req.send(params);

}



function _GetNodeColor(node){
        console.log(node.nodeType);
	if(node.nodeType.trim() == 'parent') return 'red';
	else if(node.nodeType.trim() === '3d') return 'orange';
	else return 'lightGrey';
}


function _HasConnectionOneWay(node1, node2, cons){

	var con = node1.toString() + ',' + node2.toString();
	if(cons){
		if(cons.includes(con)) return true;
	      //  for(i = 0; i < cons.length; i++){
	//		if(con.trim() == cons[i].trim()) return true;
	}
	return false;
}

function _ChunkSubstr(str, size) {
	const numChunks = Math.ceil(str.length / size)
	const chunks = new Array(numChunks)

	for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
		chunks[i] = str.substr(o, size)
	}

	return chunks
}


function _FormatDescription(rawString){

	str = _ChunkSubstr(rawString, 40)
	des = "";
	for(k = 0; k < str.length; k++){
		des+=str[k] + "<br>";
	}
	return des;
}


function BuildMap(data){
	var network = JSON.parse(data);
	console.log(network[0]);


        //Get all the nodes
	var options = {};
	var nodes = new vis.DataSet(options);

        for(i = 0; i < network.length;  i++){
/// 		console.log(network[i])
            var color = _GetNodeColor(network[i]);
		var popupData = "<b>s-code:</b> " + network[i].sCode + "<br>" +
				"<b>Type:</b> " + network[i].nodeType + "<br>" +
		 		"<b>Discription:</b><br> " + _FormatDescription(network[i].des) ;
            nodes.add({id: network[i].id, text: network[i].sCode, label:network[i].sCode, color: color, title: popupData});
	}


	//For every node, add it's edges
	var edgeList = ["1,1"];
	var edgeOptions = {};
	var edges = new vis.DataSet(edgeOptions);

	for(i = 0; i < network.length;  i++){

        	for(j = 0; j < network[i].neighbors.length; j++){

			if((!_HasConnectionOneWay(network[i].id, network[i].neighbors[j], edgeList)) &&
                          (!_HasConnectionOneWay(network[i].neighbors[j], network[i].id), edgeList) ){

				var con = (network[i].id.toString() + ',' + network[i].neighbors[j].toString()).toString();
				edgeList.push(con);
				edges.add({from:network[i].id, to: network[i].neighbors[j] });
			}
		}
	}

	console.log("Here are the nodes");

    // create a network
    var container = document.getElementById('mynetwork');
    console.log(container);
    // provide the data in the vis format
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {
       physics: false
    };

    // initialize your network!
    var nw = new vis.Network(container, data, options);


	nw.on("click", function (params) {
	console.log(params);
	console.log("The id of the node")
	console.log(params.nodes)
	GetPopupData(params.nodes);
     // Check if you clicked on a node; if so, display the title (if any) in a popup
       nw.interactionHandler._checkShowPopup(params.pointer.DOM);
});
}



function GetPopupData(id){

	var req = new XMLHttpRequest();
	var url = "server.php";
	var params = "id=" + id;

	req.open("POST", url, true);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	req.onload = function(){
		if(req.status == 200){
			console.log("here is the popup data")
			//console.log(JSON.parse(req.responseText));
			console.log(req.responseText);

		}
	}

	req.send(params);
}


function CreatePopup(sCode, description, type){


}
