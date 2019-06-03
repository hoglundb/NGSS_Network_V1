
<?php
?>

<!DOCTYPE html>
<html>
        <head>
          <!-- The Modal -->
          <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content" id="modalContent">
              <span class="close" id="onclick" onclick = "closeModal()">&times;</span>
              <div id="modalInnerHtml">some junk</div>
            </div>
          </div>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"/>
        <script  src="myscripts.js"></script>
         <script type="text/javascript" src="MapLib/vis.min.js"></script>
        <link rel="stylesheet" href="MapLib/vis.min.css" />
        <link rel="stylesheet" href="styles.css">
        </head>
        <body>
          <div class="row">
            <div class="col-lg-7">
              <div class='input-group' style='margin-top:15px; margin-left:1%; margin-bottom: 20px;width:555px'>
              <input class="form-control" id = "sCode" type="text" placeholder="S-Code" style="width:17%;margin-left:5%; margin-top:3px" aria-label="Search" >
              <input type="button" id="submitButton" class="btn btn-info" value="Search" style="margin-top:.5% ;margin-left:1%; margin-right:20px" onclick = "submit(); return false;"/>

                  <input type="checkbox" id="myCheckBox" onchange = "checkBoxSubmit(); return false;" style="margin-left:20px; margin-top:5px; width:30px; height:20px; font-size:10pt" />
              <label style = "font-size:11pt; padding-top:5px"  >Show aligned documents</label>
                <label  for "networkDepth">
              <select id = "networkDepth" style ='width:40px; border-radius:4px; margin-left:25px;font-size:10pt' onchange="checkBoxSubmit();">
                <option value = "2">2</option>
                <option value = "1">1</option>
              </select> <span style = "font-size:11pt">Depth</span>
              </label>
            </div>
              <div id="mynetwork" ></div>
             <div class="myLegend" style="width:225px">
               <div style = "margin-bottom:2px">
                  <div id='label'  style="background:#EFB2F2; float:left"> </div> <div  id='labelText' style = "float:left; margin-left:5px "> Topics</div> <br>
               </div>
               <div style = "margin-bottom:2px">
                  <div id='label'  style="background:lightGrey; float:left"> </div> <div  id='labelText' style = "float:left; margin-left:5px "> Performance Expectations</div> <br>
               </div>
                <div style = "margin-bottom:3px">
                  <div id='label'  style="background:lightBlue; float:left"> </div> <div  id='labelText' style = "float:left; margin-left:5px;"> Science & Enginering Practices</div> <br>
                </div>
                  <div style = "margin-bottom:3px">
                  <div id='label'  style="background:orange; float:left"> </div> <div id='labelText' style = "float:left; margin-left:5px"> Disiplinary Core Ideas</div> <br>
                </div>
                  <div style = "margin-bottom:3px">
                    <div id='label'  style="background:lightGreen; float:left"> </div> <div  id='labelText' style = "float:left; margin-left:5px"> Cross Cutting Concepts</div> <br>
                  </div>
                    <div id = "alignedDocsLabel" style = "display:none">
                      <div id='label'  style="background:yellow; float:left"> </div> <div  id='labelText' style = "float:left; margin-left:5px"> Aligned Documentss</div> <br>
                    </div>
                 </div>

            </div>

            <div class="stdTable" style=" margin-top:1%; margin-left:1% ;padding-right:0%; padding-left:0%;width:18%; " >
           <span style ="font-size:10pt; font-weight:bold">Standards</span>
           <div style = "height:700px; overflow-y:auto;">
           <table class="table" style="width:100%;  font-size:10pt"  id = "t1">
         <thead>
         <tr>
         <th scope="col" style="width:100%; padding:0px"></th>
         </tr>
         </thead>
         <tbody id= 't1Body' >
         <tr>
         </tr>
         </tbody>
         </table>
       </div>
         </div>
            <div class="docsTable" style="margin-top:1% ;padding-right:0%; margin-left:1%; width:18%">
              <table class="table" style="line-height: 1.2 ;width:100%; font-size:10pt; table-layout: fixed"  id = "t2">
                <tr>
                <th scope="col" style="padding:0px"><div id=t2Title></div></th>

                </tr>
              </table>
            </div>
          </div>
          <input id="currentNodeScode" style = "display:none"/>
        </body>
</html>
