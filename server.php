<?php
   include 'DBConnection.php';
if(isset($_POST['scode']) && $_POST['scode'] != ''){
  $networkDepth = 2;
    if(isset($_POST['networkDepth']) && $_POST['networkDepth'] == 1){
      $networkDepth = 1;
    }
	$networkData = BuildNetwork($_POST['scode'], $networkDepth);
	print($networkData);
}

//BuildNetwork('S2454554');


function BuildNetwork($sCode, $networkDepth){
  	$result = array();

    //Establish database connection
    $dbConnection = GetDBConnection();
    //Array to hold all of the nodes
  	$nodeList = array();

    //Add the first node
    $newNode = new StandardNode($sCode,  _GetIdFromScode($sCode, $dbConnection));
    array_push($nodeList, $newNode);

    //Add all the  neighbors of the first node and add the nodes to the array
    $neighborScodes = _GetNeighborNodeSCodes(_GetIdFromScode($sCode, $dbConnection), $dbConnection);
    foreach($neighborScodes as $neighborScode){
      $newNode = new StandardNode($neighborScode, _GetIdFromScode($neighborScode, $dbConnection));
      array_push($nodeList, $newNode);
    }

    //Add all neighbors of neighbors to the nodes array. Make sure to aviod duplicates
    if($networkDepth == 2){
      foreach($nodeList as $currentNode){
          $neighborsOfNeighbors = _GetNeighborNodeSCodes(_GetIdFromScode($currentNode->getSCode(), $dbConnection), $dbConnection);
          foreach ($neighborsOfNeighbors as $potentialNodeToAdd) {
            if(_ContainsNode($nodeList, $potentialNodeToAdd) == false){
                $newNeighborOfNeighbor = new StandardNode($potentialNodeToAdd, _GetIdFromScode($potentialNodeToAdd, $dbConnection));
                array_push($nodeList, $newNeighborOfNeighbor);
            }
        }
      }
    }

    foreach ($nodeList as $node) {
    _GetMetadataForNode($node, $dbConnection);
  }

  //For each node, add its edges to other nodes in the list
  $edges = array();
  foreach ($nodeList as $node) {
    foreach ($nodeList as $possibleNeighborNode) {
      if(_HasConnection($node->getNodeId(), $possibleNeighborNode->getNodeId(), $dbConnection) && _HasEdge($edges, $node->getNodeId(), $possibleNeighborNode->getNodeId()) == false){
         $newEdge = new Edge($node->getNodeId(), $possibleNeighborNode->getNodeId());
         array_push($edges, $newEdge);
      }
    }
  }

  //Get the document nodes
  _GetDocumentNodes($nodeList, $edges, $dbConnection);



//  print_r($edges);
   //print_r($nodeList);
	array_push($result, $nodeList, $edges);
  //$test = array();
	//array_push($test, 1);
	$testArray = json_encode($result);
  //print($testArray);
//	echo json_last_error_msg();
	//echo "\n";
	//die();

	return $testArray;
}




function _GetDocumentNodes(& $nodeList,& $edges, $dbConnection){
	$documentNodes = array();
 //Get unique list of documents connecting to PE's in the current graph
 $documents = array();
 foreach ($nodeList as $currentNode) {
	 if($currentNode->nodeType == 'Performance Expectation'){
			$documents = GetAlignmentsForPE($currentNode, $documents, $dbConnection);
	 }
 }

 //Build the document nodes
 $nodeId = 10000;
 $newNodeColor = "yellow";
 $newNodeType = "Document";
 foreach ($documents as $doc) {
 	  $newNode = new DocumentNode($nodeId, $newNodeType , $newNodeColor);
		$newNode->setDocument($doc);
		$nodeId = $nodeId + 1;
    array_push($documentNodes, $newNode);
		array_push($nodeList, $newNode);
 }

 //Add adge between every document and alligned PE
 foreach ($documentNodes as $docNode) {
	 //print_r($docNode);
 	  $allignedStandards = _GetAllignedStandardsForDocument($docNode->getNodeDocumentName(), $dbConnection);
		foreach ($allignedStandards as $alignmentScode) {
			$newEdge = new Edge($docNode->getNodeId(), _GetIdFromScode($alignmentScode, $dbConnection));
			array_push($edges, $newEdge);
		}
 }
  //print_r($edges);
 //print_r($documentNodes);
 //print_r($documents);
}



function _GetAllignedStandardsForDocument($document, $dbConnection){
	$allignedStandards = array();

	$query = "SELECT sCode FROM bh_std_ngss_alignments WHERE doc_id like '%".$document."%'";
	if($res = mysqli_query($dbConnection, $query)){
			while($row = $res->fetch_assoc()){
				if(in_array($row["sCode"], $allignedStandards) == false){
								array_push($allignedStandards, $row["sCode"]);
				}
			}
		}
		return $allignedStandards;
}


function GetAlignmentsForPE($node, $documents, $dbConnection){
		$query = "SELECT doc_id FROM bh_std_ngss_alignments WHERE sCode = '".$node->sCode."'";
		if($res = mysqli_query($dbConnection, $query)){
				while($row = $res->fetch_assoc()){
					if(in_array($row["doc_id"], $documents) == false){
								  array_push($documents, $row["doc_id"]);
					}
				}
		}
		return $documents;
}

//Returns true if that edge is already in the Edge object. Used to make sure that no
//duplicate edges are added
function _HasEdge($edges, $id1, $id2){

	foreach ($edges as $edge) {
		if(($edge->id1 == $id1 && $edge->id2 == $id2) || ($edge->id1 == $id2 && $edge->id2 == $id1)){
			return true;
		}
	}
	return false;
}


//Takes the id's of two nodes and returns true if their is an edge between them
function _HasConnection($nodeId1, $nodeId2, $dbConnection){
     $queryConnectedNodes = "SELECT mapped_id FROM bh_ngss_network_map WHERE node_id = '" . $nodeId1 . "'";
		 if($res = mysqli_query($dbConnection, $queryConnectedNodes)){
				 while($row = $res->fetch_assoc()){
					 if($nodeId2 == $row["mapped_id"]){
						 return true;
					 }
				 }
		 }
		 return false;
}


//Queries the db by s-code and returns the node id
function _GetIdFromScode($sCode, $dbConnection){
        $queryNodeId = "SELECT id from bh_ngss_network_nodes WHERE s_code = '". $sCode . "'";
        if($res = mysqli_query($dbConnection, $queryNodeId)){
                $item = $res->fetch_assoc();
                $nodeId = $item["id"];
                return $nodeId;
        }
        else print("Error retriving id from bh_ngss_network_nodes");
}


//Returns an array of sCodes that are neighbors to the node
function _GetNeighborNodeSCodes($sCode, $dbConnection){

	$neighborScodes = array();

	$queryRootNeighbors = "SELECT mapped_id FROM bh_ngss_network_map WHERE node_id = '" . $sCode . "'";
	if($res = mysqli_query($dbConnection, $queryRootNeighbors)){

      //Get all the negibors of the node
			while($row = $res->fetch_assoc()){
				array_push($neighborScodes, _GetScodeFromId($row["mapped_id"], $dbConnection));
			}
	}
  return $neighborScodes;
}


//Queries the db by node id and returns the s-code
function _GetScodeFromId($id, $dbConnection){
	$queryNodeId = "SELECT s_code from bh_ngss_network_nodes WHERE id = ". $id;
	if($res = mysqli_query($dbConnection, $queryNodeId)){
					$item = $res->fetch_assoc();
					$sCode = $item["s_code"];
					return $sCode;
	}
	else print("Error retriving sCode from bh_ngss_network_nodes");
}


#searches the array for a node with that sCode. Returns true if node is already in the list
function _ContainsNode($nodeList, $sCode){

	foreach ($nodeList as $currentNode) {
		if($currentNode->GetSCode() == $sCode){
			return true;
		}
	}
	return false;
}


function _GetMetadataForNode($node, $dbConnection){

	 $node->setDescription(iconv("UTF-8", "UTF-8//IGNORE", _GetNodeDescription($node->GetSCode(), $dbConnection)));
	 $node->setNodeType(_GetNodeType($node->getSCode(), $dbConnection));
	 $node->setNodeColor(_GetNodeColor($node->getNodeType()));
	 $node->setGradeBand(_GetNodeGradeBand($node->getSCode(), $dbConnection));
}



function _GetNodeType($sCode, $dbConnection){
	$queryType = "SELECT std_type FROM bh_ngss_network_nodes WHERE s_code = '" . $sCode . "'";
	if($res = mysqli_query($dbConnection, $queryType)){
			if($row = $res->fetch_assoc()){
				$type =  $row["std_type"];
				if($type == 'parent') return 'Standard';
				else if($type == 'child') return 'Performance Expectation';
				else if($type == '3d') return _Get3dStandardCategory($sCode, $dbConnection);
			}
			else return "could not get node type";
	}
	else return "error";
}


//Returns the grade band for the standard with the given s code
function _GetNodeGradeBand($sCode, $dbConnection){
	$queryDescription = "SELECT highgrade, lowgrade FROM std_list WHERE id = '" . $sCode . "'";
	if($res = mysqli_query($dbConnection, $queryDescription)){
			if($row = $res->fetch_assoc()){
				$lowGrade = strval($row["lowgrade"]);
				if($lowGrade == "0") $lowGrade = "k";
				$highGrade = strval($row["highgrade"]);
				if($highGrade == "0") $highGrade = "k";
				return $lowGrade . "-" . $highGrade;
			}
			else return "Description could not be found";
	}
}


function _GetNodeColor($nodeType){
	  if($nodeType == "Standard") return "#EFB2F2";
		else if($nodeType == "Performance Expectation") return "lightGrey";
		else if($nodeType == "Science and Engineering Practices") return "lightBlue";
		else if($nodeType == "Crosscutting Concepts") return "lightGreen";
		else if($nodeType == "Disciplinary Core Ideas") return "orange";
}


function _GetNodeDescription($sCode, $dbConnection){
	$queryDescription = "SELECT description FROM std_list WHERE id = '" . $sCode . "'";

	if($res = mysqli_query($dbConnection, $queryDescription)){
			if($row = $res->fetch_assoc()){
				return $row["description"];
			}
			else return "Description could not be found";
	}

}


function _Get3dStandardCategory($sCode, $dbConnection){
	$query3dType = "SELECT category FROM bh_NGSS_3D WHERE edu_std = '" . $sCode . "'";
	if($res = mysqli_query($dbConnection, $query3dType)){
			if($row = $res->fetch_assoc()){
				$category = $row["category"];
				if($category == "SEP") return "Science and Engineering Practices";
				else if($category == "CC") return "Crosscutting Concepts";
				else if($category == "DCI") return "Disciplinary Core Ideas";
				else return "Error: 3d category not found";
			}
			else return "Error";
	}
	else return "Error";
}


abstract class Node{
   public $id;
   public $nodeType;
   public $color;

   public function __construct($id){
      $this->id = $id;
   }

   public function getNodeType(){
     return $this->nodeType;
   }

   public function setNodeType($nodeType){
     $this->nodeType = $nodeType;
   }

   public function setNodeColor($color){
     $this->color = $color;
   }

   public function getNodeId(){
     return $this->id;
   }
}


class StandardNode extends Node {
  public $sCode;
  public $des;
  public $gradeBand;


  public function __construct($sCode, $id){
    $this->sCode = $sCode;
		$this->id = $id;
  }

  public function setDes($des){
     $this->des = $des;
		 JSON.stringify($this->des);
  }

  public function setGradeBand($gradeBand){
    $this->gradeBand = $gradeBand;
  }

  public function setDescription($des){
    $this->des = $des;
  }

  public function getSCode(){
    return $this->sCode;
  }
}

class DocumentNode extends Node{
  public $document;

  public function __construct($id, $nodeType, $color){
		$this->id = $id;
		$this->nodeType = $nodeType;
		$this->color = $color;
  }

  public function setDocument($document){
		$this->document = $document;
		//JSON.stringify($this->document);
	}

	public function getNodeDocumentName(){
		return $this->document;
	}

}


class Edge{
	public $id1;
	public $id2;

		public function __construct($id1, $id2){
			$this->id1 = $id1;
			$this->id2 = $id2;
		}
}

?>
