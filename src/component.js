import diff from './diff';

function Component (props) {
  this.props = props;
  this.state = this.state || {};

  this._renderCallbacks = [];
}

Object.assign(Component.prototype, {
  setState: function (state, callback) {
    if (!this.prevState) this.prevState = this.state;
    this.state = Object.assign({}, this.state, state);
    if (callback) this._renderCallbacks.push(callback);
    renderComponent(this);
  },
  forceUpdate: function(callback) {
    if (callback) this._renderCallbacks.push(callback);
    renderComponent(this);
  },
  render: function() {}
})

const buildComponentFromVNode = (dom, vnode) => {
  const props = vnode.attributes;

  let inst;
  if (dom == null) {
    inst = createComponent(vnode.type, props);
  }

  setComponentProps(inst, props);
  dom = inst.base;
  return dom;
}

const createComponent = (Constructor, props) => {
  let inst;
  if (Constructor.prototype && Constructor.prototype.render) {
    inst = new Constructor(props);
    Component.call(inst, props);
  } else {
    inst = new Component(props);
    inst.constructor = Constructor;
    inst.render = () => this.constructor(props);
  }
  return inst;
}

// componentWillMount
// componentWillReceiveProps
const setComponentProps = (component, props) => {
  if (!component.base) {
    if (component.componentWillMount) component.componentWillMount();
  } else if (component.componentWillReceiveProps){
    component.componentWillReceiveProps(props);
  }

  if (!component.prevProps) component.prevProps = component.props;
  component.props = props;

  renderComponent(component);
}

// shouldComponentUpdate
// componentWillUpdate
// render
// componentDidUpdate
const renderComponent = (component) => {
  const props = component.props;
  const state = component.state;
  const prevProps = component.prevProps || props;
  const prevState = component.prevState || state;
  const isUpdate = !!component.base;
  let skipRender = false;

  if (isUpdate) {
    component.props = prevProps;
    component.state = prevState;
    if (component.shouldComponentUpdate && component.shouldComponentUpdate(props, state) === false) {
      skipRender = true;
    } else if (component.componentWillUpdate) {
      component.componentWillUpdate(props, state);
    }
    component.props = props;
    component.state = state;
  }

  component.prevProps = component.prevState = null;

  if (!skipRender) {
    const rendered = component.render();
    const base = diff(component.base, rendered, null);
    component.base = base;

    if (component.componentDidUpdate) {
      component.componentDidUpdate(props, state);
    }
  }

  while (component._renderCallbacks.length) component._renderCallbacks.pop().call(component);
}

export { buildComponentFromVNode, Component };