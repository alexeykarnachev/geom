import { norm, cross, negate, dot, scale } from "./linear_algebra.js";


export class Camera {
    constructor() {
        this.view_dir = [0, 0, -1];
        this.position = [0, 0, 0];
        this.x_angle = 0;
        this.y_angle = 0;
    }

    get_basis() {
        let up = [0, 1, 0];
        let z = norm(this.view_dir).concat(0);
        let x = norm(cross(z, up)).concat(0);
        let y = norm(cross(x, z)).concat(0);
        z = negate(z);

        return { x: x, y: y, z: z };
    }

    get_view() {
        let basis = this.get_basis()
        let pos = [...this.position, 1];

        let matrix = [
            [basis.x[0], basis.x[1], basis.x[2], -dot(basis.x, pos)],
            [basis.y[0], basis.y[1], basis.y[2], -dot(basis.y, pos)],
            [basis.z[0], basis.z[1], basis.z[2], -dot(basis.z, pos)],
            [0, 0, 0, 1]
        ];
        return new Float32Array(matrix.flat());
    }

    move_side(x_dist, y_dist) {
        let basis = this.get_basis()
        let x = scale(basis.x, x_dist);
        let y = scale(basis.y, y_dist);

        this.position[0] += x[0] + y[0];
        this.position[1] += x[1] + y[1];
        this.position[2] += x[2] + y[2];
    }

    rotate(x_angle, y_angle) {
        this.x_angle += x_angle;
        this.y_angle += y_angle;

        let yc = Math.cos(this.y_angle);
        let ys = Math.sin(this.y_angle);
        let xc = Math.cos(this.x_angle);
        let xs = Math.sin(this.x_angle);

        this.view_dir = [ys * xc, xs, -xc * yc];
    }

    move_forward(dist) {
        let z = scale(norm(this.view_dir), dist);
        this.position[0] -= z[0];
        this.position[1] -= z[1];
        this.position[2] -= z[2];
    }
}
