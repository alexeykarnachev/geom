/** @type {HTMLDivElement} */
const CONTROL_PANEL = document.getElementById("control_panel");

const SLIDER_CONFIGS = {
    camera: {
        label: "Camera Control",
        sliders: {
            fov: { label: "FOV", min: 1, max: 180, value: 45, step: 1, conversion: to_radians },
            sensitivity: { label: "Sens", min: 0.1, max: 10, value: 2, step: 0.1, conversion: null },
        }
    },
    euler: {
        label: "Euler Rotation",
        sliders: {
            x: { label: "X", min: -360, max: 360, value: 0, step: 1, conversion: to_radians },
            y: { label: "Y", min: -360, max: 360, value: 0, step: 1, conversion: to_radians },
            z: { label: "Z", min: -360, max: 360, value: 0, step: 1, conversion: to_radians },
        },
        selects: {
            order: { label: "Order", values: ["X-Y-Z", "X-Z-Y", "Y-X-Z", "Y-Z-X", "Z-X-Y", "Z-Y-X"], value: "XYZ", conversion: remove_dashes },
        }
    }
}

function to_radians(angle) {
    return Math.PI * angle / 180;
}

function remove_dashes(value) {
    return value.replace(/-/g, "");
}

export function get_slider_value(panel_name, slider_name) {
    let config = SLIDER_CONFIGS[panel_name].sliders[slider_name];
    if (config.conversion != null) {
        return config.conversion(config.value);
    }
    return config.value;
}

export function get_select_value(panel_name, select_name) {
    let config = SLIDER_CONFIGS[panel_name].selects[select_name];
    if (config.conversion != null) {
        return config.conversion(config.value);
    }
    return config.value;
}

export function add_all_sliders() {
    add_sliders(CONTROL_PANEL, SLIDER_CONFIGS);
}

function add_sliders(parent, configs) {
    for (let panel_key in configs) {
        const panel_config = configs[panel_key];
        const panel = document.createElement("div");
        const panel_header = document.createElement("h1");
        panel_header.style.fontSize = "24px";
        panel_header.innerHTML = panel_config.label;
        panel.appendChild(panel_header);
        parent.appendChild(panel);
        for (let slider_key in panel_config.sliders) {
            const slider_conf = panel_config.sliders[slider_key];
            add_slider(panel, slider_conf);
        }

        for (let select_key in panel_config.selects) {
            const select_conf = panel_config.selects[select_key];
            add_select(panel, select_conf);
        }
    }
}

function add_slider(parent, config) {
    let div = document.createElement("div");
    let inp = document.createElement("input");
    let label = document.createElement("label");
    let label_span = document.createElement("span");

    div.style.flexDirection = "row";
    div.style.display = "flex";
    div.style.width = "max-content";
    div.style.verticalAlign = "top";

    inp.type = "range";
    inp.min = config.min;
    inp.max = config.max;
    inp.step = config.step;
    inp.value = config.value;
    inp.style.width = "300px";

    label.style.fontSize = "22px";
    label.style.margin = "0.5%";
    label.style.width = "250px";
    label.innerHTML = config.label;

    label_span.innerHTML = ": " + config.value.toFixed(3);

    inp.oninput = function () {
        config.value = parseFloat(this.value);
        label_span.innerHTML = ": " + config.value.toFixed(3);
    }

    label.appendChild(label_span);
    div.appendChild(inp);
    div.appendChild(label);
    parent.appendChild(div);
}

function add_select(parent, config) {
    let label = document.createElement("label");
    let select = document.createElement("select");

    label.innerHTML = config.label + ": ";
    label.style.fontSize = "20px";

    select.style.fontSize = "16px";
    for (let value of config.values) {
        let option = document.createElement("option");
        option.value = value;
        option.innerHTML = value;
        select.appendChild(option);
    }

    select.onchange = function() {
        let value = this.options[this.selectedIndex].text;
        if (config.conversion != null) {
            value = config.conversion(value);
        }
        config.value = value;
    }

    label.appendChild(select);
    parent.appendChild(label);
}
