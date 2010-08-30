var STLGeometry = function(stl_string) {
	THREE.Geometry.call(this);

	var scope = this;

  var stl_info  = parse_stl(stl_string);
  var vertexes  = stl_info[0];
  var normals   = stl_info[1];
  var faces     = stl_info[2];

  for (var i=0; i<vertexes.length; i++) {
    v(vertexes[i][0], vertexes[i][1], vertexes[i][2]);
    // console.log("vertex = " + vertexes[i][0] + ", " + vertexes[i][1] + ", " + vertexes[i][2]);
  }

  for (var i=0; i<faces.length; i++) {
    f3(faces[i][0], faces[i][1], faces[i][2]);
    // console.log("face = " + faces[i][0] + ", " + faces[i][1] + ", " + faces[i][2]);
  }

  function v(x, y, z) {
    scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );
  }

  function f3(a, b, c) {
    scope.faces.push( new THREE.Face3( a, b, c ) );
  }

  // console.log("Starting to compute normals")

	this.computeNormals();
	
  // console.log("Finished STLGeometry")
}

STLGeometry.prototype = new THREE.Geometry();
STLGeometry.prototype.constructor = STLGeometry;

// indexOf only finds strings? seriously Javascript, seriously?!
Array.prototype.myIndexOf = function(searchstring, indexstart) {
  if (indexstart == undefined) {
    indexstart = 0;
  }
  
	var result = -1;
	for (i=indexstart; i<this.length; i++) {
		if (this[i] == searchstring) {
			result = i;
			break;
		}
	}
	return result;
};

// FIXME: optimization me please!
function parse_stl(stl_data) {
  // build stl's vertex and face arrays
  
  var vertexes  = [];
  var normals   = [];
  var faces     = [];
  
  var face_vertexes = [];
  
  stl_data = stl_data.replace(/\n/g, " ");
  stl_data = stl_data.replace(/\s+/g, " ");

  facet_blocks = stl_data.match(/facet normal.*?endfacet/g);
  // console.log("found " + facet_blocks.length + " blocks");
  for (var i=0; i<facet_blocks.length; i++) {
    facet_block = facet_blocks[i];
    // console.log(i + " BLOCK: " + facet_block + "\n");

    // FIXME: some STL files have extended notation like 1.12312e-12, should probably just split on spaces instead of regex...
    normal_blocks = /normal ([-+]?[0-9]*\.?[0-9]+) ([-+]?[0-9]*\.?[0-9]+) ([-+]?[0-9]*\.?[0-9]+) outer/.exec(facet_block);
    normal_points = [parseFloat(normal_blocks[1]), parseFloat(normal_blocks[2]), parseFloat(normal_blocks[3])];
    normals.push(normal_points);

    vertex_parts = facet_block.match(/vertex ([-+]?[0-9]*\.?[0-9]+) ([-+]?[0-9]*\.?[0-9]+) ([-+]?[0-9]*\.?[0-9]+) /g);
    for (var vpi=0; vpi<vertex_parts.length; vpi++) {      
      vertex_part = vertex_parts[vpi];
      // console.log("vertex_part = " + vertex_part);
      vertex_blocks = /vertex ([-+]?[0-9]*\.?[0-9]+) ([-+]?[0-9]*\.?[0-9]+) ([-+]?[0-9]*\.?[0-9]+)/.exec(vertex_part);
      vertex_points = [parseFloat(vertex_blocks[1]), parseFloat(vertex_blocks[2]), parseFloat(vertex_blocks[3])];
      
      if (vertexes.myIndexOf(vertex_points) == -1) {
        vertexes.push(vertex_points);
      }

      if (face_vertexes[i] == undefined) {
        face_vertexes[i] = [];
      }
      face_vertexes[i].push(vertex_points);
    }
  }

  // console.log("calculating faces")
  for (var i=0; i<face_vertexes.length; i++) {
    // console.log("face vertex " + i + " = " + face_vertexes[i]);
    
    if (faces[i] == undefined) {
      faces[i] = [];
    }
  
    for (var fvi=0; fvi<face_vertexes[i].length; fvi++) {
      // console.log(i + " looking for " + face_vertexes[i][fvi])
      faces[i].push(vertexes.myIndexOf(face_vertexes[i][fvi]))
      // console.log("found " + vertexes.indexOf(face_vertexes[i][fvi]))
    }
  
    // for material
    faces[i].push(0);
  }
  
  // for (var i=0; i<normals.length; i++) {
    // console.log('passing normal: ' + normals[i][0] + ", " + normals[i][1] + ", " + normals[i][2]);
  // }
  
  // for (var i=0; i<vertexes.length; i++) {
    // console.log('passing vertex: ' + vertexes[i][0] + ", " + vertexes[i][1] + ", " + vertexes[i][2]);
  // }
  
  // for (var i=0; i<faces.length; i++) {
    // console.log('passing face: ' + faces[i][0] + ", " + faces[i][1] + ", " + faces[i][2]);
  // }
  // 
  // console.log("end");
  // document.getElementById('debug').innerHTML = stl_data;
  
  // console.log("finished parsing stl")
  return [vertexes, normals, faces];
}
