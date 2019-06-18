<?php
include 'DBConnection.php';

//Color definitions
define("GREEN_COLOR", "#CDE49F");
define("ORANGE_COLOR", "#FBC08C");
define("BLUE_COLOR", "#9FBDE4");
define("DOC_COLOR","#DFD4C8");
define("TOPIC_COLOR", "#EFB2F2");

//Standards definitions and abreveations
define("PE", "Performance Expectation");
define("TOPIC", "Standard");
define("DCI", "Disciplinary Core Ideas");
define("SEP", "Science and Engineering Practices");
define("CC", "Crosscutting Concepts");

if(isset($_POST['scode']) && $_POST['scode'] != ''){
  $networkDepth = 2;
    if(isset($_POST['networkDepth']) && $_POST['networkDepth'] == 1){
      $networkDepth = 1;
    }
	$networkData = BuildNetwork($_POST['scode'], $networkDepth);
	print($networkData);
}

//BuildNetwork('S2454554', 2);
function BuildNetwork($sCode, $networkDepth){

  //Get the connection to the prod_edu_standards_db database
  $dbConnection = GetDBConnection();

  $postArray = array(); //holds the results that get posted to the client

  //The edge list node Objects. This is the required vis.js format
  $nodeList = array();
  $edgeList = array();
  $sCodesHashMap = array(); //Used as hash table when checking if a node is in the graph
  $edgesHashMap = array();

  //Get the s-code if user submitted p-code
  if($sCode[0] != 'S') {
    $sCode = GetPCodeFromSCode($dbConnection, $sCode);
  }

  //Get the network one step from the root node
  GetNodesOneLevelDeep($dbConnection, $sCode, $edgeList, $nodeList, $sCodesHashMap, $edgesHashMap);

  if($networkDepth == 2){
    GetNodesTwoLevelsDeep($dbConnection, $sCode, $edgeList, $nodeList, $sCodesHashMap, $edgesHashMap);
  }

  //Get the metadata for each node in the network.
  for($i = 0; $i < count($nodeList); $i++){
    GetStandardNodeMetadata($nodeList[$i], $dbConnection);
  }

  GetAlignedDocuments($dbConnection, $edgeList, $nodeList, $edgesHashMap);


  //print_r($nodeList);
  //print_r($edgeList);
  //print_r($sCodesHashMap);
  array_push($postArray, $nodeList);
  array_push($postArray, $edgeList);
  return json_encode($postArray);
}


//Gets the aligned documents and adds them to the network
function GetAlignedDocuments($dbConnection, & $edgeList, & $nodeList, & $edgesHashMap){
  $docNodesInNetwork = array();
    //For each node n in the nw
        //Get all the documents d aligned with n
        //For each document d
            //if d not in network
                //add d to network
            //add a connection from n to d
    $docIdStart = 10001;
    for($i = 0; $i < count($nodeList); $i++){
      $curStd = $nodeList[$i]->sCode;
      $query = "SELECT doc_id FROM bh_std_ngss_alignments WHERE sCode = '".$curStd."'";
      if($res = mysqli_query($dbConnection, $query)){
        while($row = $res->fetch_assoc()){

          //Add a connection from the document to the node
          $newEdge = new Edge($docIdStart, $nodeList[$i]->id);
          array_push($edgeList, $newEdge);

         //If document node not in network, create new doc node
         if(!array_key_exists($row['doc_id'], $docNodesInNetwork)){
           $newDoc = _CreateNewDocumentNode($row['doc_id'], $docIdStart);
           array_push($nodeList, $newDoc);
           $docIdStart++;
           $docNodesInNetwork[$row['doc_id']] = $row['doc_id'];
         }
        }
      }
    }
}


//Returns a DocumentNode object with its metadata
function _CreateNewDocumentNode($docId, $id){

  $docNode = new DocumentNode();
  $docNode->id = $id;
  $docNode->document = $docId;
  $docNode->nodeType = "Document";
  $docNode->color = DOC_COLOR;


  return $docNode;
}

//Gets the network one level deep and puts the resuls in $edgeList and $nodeList
function GetNodesOneLevelDeep($dbConnection, $sCode, & $edgeList, & $nodeList, & $sCodesHashMap, & $edgesHashMap){

  //Get the root node that was searched by
  $rootNodeId = _GetIdFromScode($sCode, $dbConnection);
  $rootNode = new StandardNode($sCode, $rootNodeId, 0);
  $sCodesHashMap[$rootNodeId] = $rootNodeId;
  array_push($nodeList, $rootNode);

  //Get all nodes one step from the root node. Add the corrisponding edges.
  $query = "SELECT * FROM bh_ngss_network_map WHERE node_id = '".$rootNodeId."'";
  if($res = mysqli_query($dbConnection, $query)){
    while($row = $res->fetch_assoc()){
      $childNode = new StandardNode(null, $row['mapped_id'], 1);
      $sCodesHashMap[$row['mapped_id']] = $row['mapped_id'];
      $newEdge = new Edge($rootNodeId, $row['mapped_id']);
      array_push($edgeList, $newEdge);
      array_push($nodeList, $childNode);

      $e1 = $row['mapped_id'] . '&' . $row['node_id'];
      $e2 = $row['node_id'] . '&' . $row['mapped_id'];
      $edgesHashMap[$e1] = $e1;
      $edgesHashMap[$e2] = $e2;
    }
  }
  return $nodeList;
}


//Gets the nodes two steps away from the root node and addes them to the network. Also adds the edges
function GetNodesTwoLevelsDeep($dbConnection, $sCode, & $edgeList, & $nodeList, & $nodeIdsHashMap, & $edgesHashMap){
  //temp array store the level 2 arrays to be added to the node list
  $level2Nodes = array();


  //For every node in the network
  for($i = 1; $i < count($nodeList); $i++){
    if($nodeList[$i]->level == 0) continue;
    //Query the nodes connected to node i
    $curId = $nodeList[$i]->id;
    $query = "SELECT node_id, mapped_id FROM bh_ngss_network_map WHERE node_id = '".$curId."'";
    if($res = mysqli_query($dbConnection, $query)){
      while($row = $res->fetch_assoc()){
        //If level 2 neighbor not in network, add new node. Also add to the edge list
         if(!ContainsNode($row['mapped_id'], $nodeIdsHashMap)){
           $newNode = new StandardNode(null, $row['mapped_id'], 2);
           array_push($level2Nodes, $newNode);
           $nodeIdsHashMap[$row['mapped_id']] = $row['mapped_id'];
         }
         //Add the connection from node i to the new node we just created, but check for duplicates first
         $e1 = $row['mapped_id'] . '&' . $row['node_id'];
         $e2 = $row['node_id'] . '&' . $row['mapped_id'];

         if(!array_key_exists($e1, $edgesHashMap) && !array_key_exists($e2, $edgesHashMap)){
              $newEdge = new Edge($curId, $row['mapped_id']);
              array_push($edgeList, $newEdge);
         }
         $edgesHashMap[$e1] = $e1;
         $edgesHashMap[$e2] = $e2;

      }
    }
  }

  //Add the level 2 nodes to the nodes array
  for($i = 0; $i < count($level2Nodes); $i++){
      array_push($nodeList, $level2Nodes[$i]);
  }

  //Check if any level 2 nodes have connections with other level 2 nodes.
  for($i = 0; $i < count($nodeList); $i++){
     if($nodeList[$i]->level == 2){
       for($j = 0; $j < count($nodeList); $j++){
         if($nodeList[$j]->level == 2 && $nodeList[$j]->id != $nodeList[$i]->id){
           if(_IsNeighboringNode($dbConnection, $nodeList[$i]->id, $nodeList[$j]->id)){
            //Add new edge to the edge list, but make sure a duplicate edge is not being added.
            $newEdge = new Edge($nodeList[$i]->id, $nodeList[$j]->id);
            $e1 = $nodeList[$i]->id . '&' . $nodeList[$j];
            $e2 = $nodeList[$j]->id . '&' . $nodeList[$i];
            if(!array_key_exists($e1, $edgesHashMap) && !array_key_exists($e2, $edgesHashMap)){
              array_push($edgeList, $newEdge);
              $edgesHashMap[$e1] = $e1;
              $edgesHashMap[$e2] = $e2;
            }
           }
         }
     }
   }
  }
}


//Queries the db and returns true if the two nodes given are neighbors
  function _IsNeighboringNode($dbConnection, $id1, $id2){
    $query = "SELECT * FROM bh_ngss_network_map WHERE node_id = '".$id1."' AND mapped_id = '".$id2."' or node_id = '".$id2."' AND mapped_id = '".$id1."'  ";
    if($res = mysqli_query($dbConnection, $query)){
      if($row = $res->fetch_assoc()){
          return true;
      }
    }
    return false;
  }


//Queries the db by s-code and returns the node id
function _GetIdFromScode($sCode, $dbConnection){
        $queryNodeId = "SELECT id from bh_ngss_network_nodes2 WHERE sCode = '". $sCode . "'";
        if($res = mysqli_query($dbConnection, $queryNodeId)){
                $item = $res->fetch_assoc();
                $nodeId = $item["id"];
                return $nodeId;
        }
        else print("Error retriving id from bh_ngss_network_nodes");
}


//Gets all the data pertaining to the standard, including sCode, color, gradeband, description...etc
function GetStandardNodeMetadata(& $nodeObj, $dbConnection){
    $query = "SELECT id, std_type, description, lowgrade, highgrade, sCode FROM bh_ngss_network_nodes2 WHERE id = '".$nodeObj->id."'";
    if($res = mysqli_query($dbConnection, $query)){
      if($row = $res->fetch_assoc()){
        $nodeObj->sCode = $row['sCode'];
        $nodeObj->nodeType = _SetStandardType($row['std_type'], $row['sCode'], $dbConnection);
        $nodeObj->gradeBand = _SetStandardGradeBand($row['lowgrade'], $row['highgrade']);
        $nodeObj->color = _SetNodeColor($nodeObj->nodeType);
        $nodeObj->des = iconv("UTF-8", "UTF-8//IGNORE", $row['description']);
        $nodeObj->pCode = _GetPCode($row['sCode'], $dbConnection);
      }
    }
}


//Returns true if the current network contains this node
function ContainsNode($nodeId, & $sCodeList){
   if(array_key_exists($nodeId, $sCodeList)){
     return true;
   }
   return false;
}


//Returns the corrisponding pCode for the standard with the given sCode
function _GetPCode($sCode, $dbConnection){
  $queryNGSS = "SELECT pCode FROM bh_ngss_uri_mappings WHERE  sCode = '" . $sCode . "'";
  if($res = mysqli_query($dbConnection, $queryNGSS)){
    if($row=$res->fetch_assoc()){
      return $row["pCode"];
    }
    return "error1";
  }
  return "error2";
}

//Returns the color for the node
function _SetNodeColor($nodeType){
  if($nodeType == 'Performance Expectation') return 'lightGrey';
  else if($nodeType == "Science and Engineering Practices") return BLUE_COLOR;
  else if($nodeType == "Crosscutting Concepts") return GREEN_COLOR;
  else if($nodeType == "Disciplinary Core Ideas") return ORANGE_COLOR;
  else if($nodeType == "Standard") return TOPIC_COLOR;
}


//Returns the formatted grade band from highgrade and lowgrade
function _SetStandardGradeBand($low, $high){
  $lowGrade = strval($low);
  if($lowGrade == "0") $lowGrade = "k";
  $highGrade = strval($high);
  if($highGrade == "0") $highGrade = "k";
  return $lowGrade . "-" . $highGrade;
}


//Sets the standard type: PE, DCI, etc...
function _SetStandardType($type, $sCode, $dbConnection){
  if($type == "parent"){
    return "Standard";
  }
  if($type == "child"){
    return "Performance Expectation";
  }
  else {
    return  _Get3dStandardCategory($sCode, $dbConnection);
  }
}


//Helper function for _SetStandardType()
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
			else return "Error1";
	}
	else return "Error2";
}

//Function takes an NGSS p-code and querries for the corrisponding ASN s-code
function GetPCodeFromSCode($dbConnection, $sCode){
  $query = "SELECT sCode FROM bh_ngss_uri_mappings WHERE pCode = '".$sCode."'";
  if($res = mysqli_query($dbConnection, $query)){
    if($row = $res->fetch_assoc()){
        if($row["sCode"]){
                return $row["sCode"];
        }
      }
    }
    else return null;
}


class Node{
  public $nodeType;
  public $id;
  public $color;
}


class Edge{
  public $id1;
  public $id2;

  public function __construct($id1, $id2){
      $this->id1 = $id1;
      $this->id2 = $id2;
  }
}


class StandardNode extends Node{
  public $sCode;
  public $pCode;
  public $des;
  public $gradeBand;
  public $level;
  public function __construct($sCode, $id, $level){
    $this->sCode = $sCode;
    $this->id = $id;
    $this->level = $level;
  }
}


class DocumentNode extends Node{
  public $document;
  public $NGSSCode;
  public function __construct($id, $nodeType, $color){
    $this->id = $id;
    $this->nodeType = $nodeType;
    $this->color = $color;
  }
}
?>
