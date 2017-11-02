import { selection } from "d3-selection";
import provide from "./src/provide";
import dataFromState from "./src/dataFromState";
import datumFromState from "./src/datumFromState";
import dispatchOn from "./src/dispatchOn";

selection.prototype.provide = provide;
selection.prototype.dataFromState = dataFromState;
selection.prototype.datumFromState = datumFromState;
selection.prototype.dispatchOn = dispatchOn;
