<template>
  <div class="row" v-if="$store.state.devices.length > 0">
    <div
      v-for="(widget, index) in $store.state.selectedDevice.template.widgets"
      :key="index"
      :class="[widget.column]"
    >
      <Json :value="fixWidget(widget)"></Json>
      <Rtnumberchart
        v-if="widget.widget == 'numberchart'"
        :config="fixWidget(widget)"
      ></Rtnumberchart>

      <Iotswitch
        v-if="widget.widget == 'switch'"
        :config="fixWidget(widget)"
      ></Iotswitch>

      <Iotbutton
        v-if="widget.widget == 'button'"
        :config="fixWidget(widget)"
      ></Iotbutton>

      <Iotindicator
        v-if="widget.widget == 'indicator'"
        :config="fixWidget(widget)"
      ></Iotindicator>
    </div>
  </div>
</template>
<script>
import Rtnumberchart from "~/components/Widgets/Rtnumberchart.vue";
import Iotbutton from "~/components/Widgets/Iotbutton.vue";
import Iotindicator from "~/components/Widgets/Iotindicator.vue";
import Iotswitch from "~/components/Widgets/Iotswitch.vue";

export default {
  middleware: "authenticated",
  name: "Dashboard",
  components: {
    Rtnumberchart,
    Iotbutton,
    Iotindicator,
    Iotswitch
  },
  data() {
    return {};
  },
  mounted() {},
  methods: {
    fixWidget(widget) {
      var widgetCopy = JSON.parse(JSON.stringify(widget));
      widgetCopy.selectedDevice.dId = this.$store.state.selectedDevice.dId;
      widgetCopy.selectedDevice.name = this.$store.state.selectedDevice.name;
      widgetCopy.userId = this.$store.state.selectedDevice.userId;
      if (widget.widget == "numberchart") {
        widgetCopy.demo = false;
      }
      return widgetCopy;
    }
  }
};
</script>
