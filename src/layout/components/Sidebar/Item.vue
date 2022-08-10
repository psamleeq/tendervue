<script>
export default {
  name: 'MenuItem',
  functional: true,
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    isNew: {
      type: Boolean,
      default: false
    }
  },
  render(h, context) {
    const { icon, title, isNew } = context.props
    const vnodes = []

    if (icon) {
      if (icon.includes('el-icon')) {
        vnodes.push(<i class={[icon, 'sub-el-icon']} />)
      } else {
        vnodes.push(<svg-icon icon-class={icon}/>)
      }
    }

    if (title) {
      if (isNew) {
        vnodes.push(<span slot='title'>{(title)}<span class="newItem">  NEW!!</span></span>)
      } else {
        vnodes.push(<span slot='title'>{(title)}</span>)
      }
    }

    return vnodes
  }
}
</script>

<style scoped>
.sub-el-icon {
  color: currentColor;
  width: 1em;
  height: 1em;
}
.newItem {
  color: #E6A23C;
  font-style: italic; 
  font-size: 10px;
  font-weight: bold;
}
</style>