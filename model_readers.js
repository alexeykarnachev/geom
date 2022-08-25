export async function read_obj(file_path) {
    return await fetch(file_path).then(result => result.text()).then(text => {
        let lines = text.split(/\n/);
        let vertex_positions = [];
        let vertex_indices = [];

        for (let line of lines) {
            if (!line.startsWith("#")) {
                let values = line.split(/\s/);
                let type = values[0];
                values = values.slice(1);

                if (type === "v") {
                    if (values.length < 3 || values.length > 4) {
                        throw("Vertex must contain 3 (x, y, z) or 4 (x, y, z, w) elements");
                    } else {
                        vertex_positions.push(...values);
                        if (values.length == 3) {
                            vertex_positions.push(1.0);
                        }
                    }
                } else if (type === "f") {
                    if (values.length != 3) {
                        throw("Vertex face must contain 3 elements (x, y, z)");
                    }
                    for (let value of values) {
                        let indices = value.split(/\//);
                        vertex_indices.push(indices[0]);
                    }
                }
            }
        }
        return {
            vertex_positions: new Float32Array(vertex_positions),
            vertex_indices: new Uint16Array(vertex_indices)
        };
    });
}
