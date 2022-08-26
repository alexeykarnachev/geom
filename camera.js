import { norm, cross, negate, dot, scale } from "./linear_algebra";


export class Camera {
    constructor() {
        this.view_dir = [0, 0, -1];
        this.position = [0, 0, 0];
    }

    get_view() {
        let up = [0, 1, 0];
        let z = norm(this.view_dir).concat(0);
        let x = norm(cross(z, up)).concat(0);
        let y = norm(cross(x, z)).concat(0);
        z = negate(z);

        let pos = [...this.position, 1];

        let matrix = [
            [x[0], x[1], x[2], -dot(x, pos)],
            [y[0], y[1], y[2], -dot(y, pos)],
            [z[0], z[1], z[2], -dot(z, pos)],
            [0, 0, 0, 1]
        ];
        return new Float32Array(matrix.flat());
    }

    move(x_dist, y_dist) {
        let up = [0, 1, 0];
        let z = norm(this.view_dir).concat(0);
        let x = norm(cross(z, up)).concat(0);
        let y = norm(cross(x, z)).concat(0);
        z = negate(z);

        x = scale(x, x_dist);
        y = scale(y, y_dist);

        this.position[0] += x[0] + y[0];
        this.position[1] += x[1] + y[1];
        this.position[2] += x[2] + y[2];
    }

}
