import { get_model_matrix } from "./linear_algebra.js";

export class Animator {
    constructor(active_duration, cooldown_duration, rotation_order, transformation_order) {
        this.active_duration = active_duration;
        this.cooldown_duration = cooldown_duration;
        this.total_duration = this.active_duration + this.cooldown_duration;
        this.stage_duration = this.active_duration / 3;
        this.current_duration = 0;

        this.rotation_order = rotation_order.toLowerCase().split(" ");
        this.transformation_order = transformation_order.toLowerCase().split(" ");
        this.is_started = false;
    }

    get progress() {
        return Math.max(1, this.current_duration / this.active_duration);
    }

    get current_stage_idx() {
        return Math.min(2, Math.floor(this.current_duration / this.stage_duration));
    }

    get current_stage_str() {
        return this.transformation_order[this.current_stage_idx].toLowerCase();
    }

    get current_stage_progress() {
        return Math.min(1.0, this.current_duration / this.stage_duration - this.current_stage_idx);
    }

    get_stage_progress(stage_idx) {
        if (stage_idx < this.current_stage_idx) {
            return 1.0;
        } else if (stage_idx == this.current_stage_idx) {
            return this.current_stage_progress;
        } else {
            return 0.0;
        }
    }

    get_stage_str(stage_idx) {
        return this.transformation_order[stage_idx].toLowerCase();
    }

    get_axis_str(axis_idx) {
        return this.rotation_order[axis_idx].toLowerCase();
    }

    toggle(is_started) {
        this.is_started = is_started;
        if (!this.is_started) {
            this.current_duration = 0;
        }
    }

    step(dt) {
        if (!this.is_started) {
            return;
        }
        this.current_duration = (this.current_duration + dt) % (this.total_duration);
    }

    animate(scale, translation, rotation) {
        let new_scale = { ...scale };
        let new_translation = { ...translation };
        let new_rotation = { ...rotation };

        if (this.is_started) {
            for (let stage_idx = 0; stage_idx < 3; ++stage_idx) {
                let stage_str = this.get_stage_str(stage_idx);
                if (stage_str === "s") {
                    let stage_progress = hermit(0, 1, this.get_stage_progress(stage_idx));
                    for (let axis of ["x", "y", "z"]) {
                        new_scale[axis] = stage_progress * (scale[axis] - 1) + 1;
                    }
                } else if (stage_str === "t") {
                    let stage_progress = hermit(0, 1, this.get_stage_progress(stage_idx));
                    for (let axis of ["x", "y", "z"]) {
                        new_translation[axis] = stage_progress * translation[axis];
                    }
                } else if (stage_str === "r") {
                    let stage_progress = this.get_stage_progress(stage_idx);
                    let rotation_stage = Math.floor(stage_progress * 3);
                    let rotation_stage_progress = hermit(0, 1, stage_progress * 3 - rotation_stage);
                    for (let axis_idx = 0; axis_idx < 3; ++axis_idx) {
                        let cur_axis = this.get_axis_str(axis_idx);
                        if (axis_idx < rotation_stage) {
                            new_rotation[cur_axis] = rotation[cur_axis];
                        } else if (axis_idx === rotation_stage) {
                            new_rotation[cur_axis] = rotation_stage_progress * rotation[cur_axis];
                        } else {
                            new_rotation[cur_axis] = 0.0;
                        }
                    }
                } else {
                    throw (`Incorrect Animator stage: ${stage_str}`);
                }
            }
        }

        let model_matrix = get_model_matrix(
            new_scale, new_rotation, new_translation, this.rotation_order, this.transformation_order);
        return model_matrix;
    }
}

function hermit(a, b, p) {
    let t = clamp((p - a) / (b - a), 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
}

function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
}
