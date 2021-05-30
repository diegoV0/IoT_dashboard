<template>

  <div class="row">
   <Iotindicator :config="configIndicator"></Iotindicator>
   <button @click="sendData1()">SEND</button>
    <Iotbutton :config="configButton"></Iotbutton>

  </div>
</template>

<script>
import Iotbutton from '../components/Widgets/Iotbutton.vue';
import Iotindicator from "../components/Widgets/Iotindicator.vue";

export default {
  components: {
    Iotindicator,
    Iotbutton
  },

  data() {
    return {
      value: false,
      configButton:{
        userId: "userid",
        selectedDevice: {
          name: "Home",
          dId: "8888",
          templateName: "Power Sensor",
          templateId: "984237562348756ldksjfh",
          saverRule: false
        },
        variableFullName: "Pump",
        variable: "var1",
        icon: "fa-sun",
        column: "col-6",
        widget: "indicator",
        class: "success",
        message: "{'fanstatus': 'stop'}"
      },
      configIndicator: {
        userId: "userid",
        selectedDevice: {
          name: "Home",
          dId: "8888",
          templateName: "Power Sensor",
          templateId: "984237562348756ldksjfh",
          saverRule: false
        },
        variableFullName: "Pump",
        variable: "var1",
        icon: "fa-sun",
        column: "col-6",
        widget: "indicator",
        class: "success"
      },
    };
  },
  methods: {
        sendData1() {
      this.value = !this.value;
      const toSend = {
        value: this.value
      };
      this.$nuxt.$emit("userid/8888/var1/sdata", toSend);
    },
  }
};
</script>