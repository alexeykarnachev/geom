export function matmul(a, b) {
    let res = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ];

    for (let i_row = 0; i_row < 4; ++i_row) {
        for (let i_col = 0; i_col < 4; ++i_col) {
            for (let i_val = 0; i_val < a.length; ++i_val) {
                res[i_row][i_col] += a[i_row][i_val] * b[i_val][i_col];
            }
        }
    }

    return res;
}

export function get_scale_matrix(x, y, z) {
    return [
        [x, 0, 0, 0],
        [0, y, 0, 0],
        [0, 0, z, 0],
        [0, 0, 0, 1],
    ];
}

export function get_translation_matrix(x, y, z) {
    return [
        [1, 0, 0, x],
        [0, 1, 0, y],
        [0, 0, 1, z],
        [0, 0, 0, 1],
    ];
}

export function get_rotation_over_x_matrix(angle) {
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);
    return [
        [1, 0, 0, 0],
        [1, cos, -sin, 0],
        [1, sin, cos, 0],
        [0, 0, 0, 1],
    ];
}

export function get_rotation_over_y_matrix(angle) {
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);
    return [
        [cos, 0, sin, 0],
        [0, 1, 0, 0],
        [-sin, 0, cos, 0],
        [0, 0, 0, 1],
    ];
}

export function get_rotation_over_z_matrix(angle) {
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);
    return [
        [cos, -sin, 0, 0],
        [sin, cos, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ];
}

export function get_perspective_projection(fov, znear, zfar, aspect_ratio) {
    let f = 1.0 / Math.tan(fov / 2.0);
    let range_inv = 1.0 / (znear - zfar);
    let matrix = [
        [f / aspect_ratio, 0, 0, 0],
        [0, f, 0, 0],
        [0, 0, (znear + zfar) * range_inv, znear * zfar * range_inv * 2],
        [0, 0, -1, 0],
    ];

    return new Float32Array(matrix.flat());
}

export function get_modelview(scale, rotation, translation) {
    let s = get_scale_matrix(scale.x, scale.y, scale.z);
    let rx = get_rotation_over_x_matrix(rotation.x);
    let ry = get_rotation_over_y_matrix(rotation.y);
    let rz = get_rotation_over_z_matrix(rotation.z);
    let r = matmul(matmul(rx, ry), rz);
    let t = get_translation_matrix(translation.x, translation.y, translation.z);
    let matrix = matmul(matmul(s, r), t);

    return new Float32Array(matrix.flat());
}

