export function matmul(m1, m2) {
    let res = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ];

    for (let i_row = 0; i_row < 4; ++i_row) {
        for (let i_col = 0; i_col < 4; ++i_col) {
            for (let i_val = 0; i_val < 4; ++i_val) {
                res[i_row][i_col] += m1[i_row][i_val] * m2[i_val][i_col];
            }
        }
    }

    return res;
}

export function matvecmul(m, v) {
    let res = [0, 0, 0, 0];

    for (let i_row = 0; i_row < 4; ++i_row) {
        for (let i_val = 0; i_val < 4; ++i_val) {
            res[i_row] += m[i_row][i_val] * v[i_val];
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
        [0, cos, -sin, 0],
        [0, sin, cos, 0],
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

export function matmul_chain(...matrices) {
    let res = [
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0],
    ];

    for (let mat of matrices) {
        res = matmul(mat, res);
    }

    return res;
}

export function get_rotation_matrix(order, x, y, z) {
    let rx = get_rotation_over_x_matrix(x);
    let ry = get_rotation_over_y_matrix(y);
    let rz = get_rotation_over_z_matrix(z);
    if (order === "XYZ") {
        return matmul_chain(rz, ry, rx);
    } else if (order === "XZY") {
        return matmul_chain(ry, rz, rx);
    } else if (order === "YXZ") {
        return matmul_chain(rz, rx, ry);
    } else if (order === "YZX") {
        return matmul_chain(rz, rz, ry);
    } else if (order === "ZXY") {
        return matmul_chain(ry, rx, rz);
    } else if (order === "ZYX") {
        return matmul_chain(rx, ry, rz);
    } else {
        throw(`Wrong rotation order: ${order}, please select one of the "XYZ" permutations`);
    }
}

export function get_model(scale, rotation, translation, rotation_order="XYZ") {
    let s = get_scale_matrix(scale.x, scale.y, scale.z);
    let r = get_rotation_matrix(rotation_order, rotation.x, rotation.y, rotation.z);
    let t = get_translation_matrix(translation.x, translation.y, translation.z);
    let matrix = matmul_chain(s, r, t);

    return new Float32Array(matrix.flat());
}

export function norm(v) {
    let res = [0, 0, 0];
    let length = 0;
    for (let i = 0; i < 3; ++i) {
        length += v[i] * v[i];
    }
    length = Math.sqrt(length);

    for (let i = 0; i < 3; ++i) {
        res[i] = v[i] / length;
    }

    return res;
}

export function cross(v1, v2) {
    return [
        v1[1] * v2[2] - v1[2] * v2[1],
        v1[2] * v2[0] - v1[0] * v2[2],
        v1[0] * v2[1] - v1[1] * v2[0],
    ]
}

export function dot(v1, v2) {
    let res = 0;
    for (let i = 0; i < 4; ++i) {
        res += v1[i] * v2[i];
    }
    return res;
}

export function negate(v) {
    let res = [0, 0, 0, 0];
    for (let i = 0; i < 4; ++i) {
        res[i] = -v[i];
    }
    return res;
}

export function scale(v, k) {
    let res = [0, 0, 0, 0];
    for (let i = 0; i < 4; ++i) {
        res[i] = v[i] * k;
    }
    return res;
}
