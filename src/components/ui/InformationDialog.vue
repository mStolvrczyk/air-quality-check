<template>
  <v-dialog
    persistent
    v-model="informationDialogVisibility"
    :max-width="informationDialogWidth"
  >
    <div id="information-dialog-card">
      <div class="row information-dialog">
        <h3 class="information-info">{{ information }}</h3>
      </div>
      <div class="row information-dialog">
        <v-btn @click="closeInformationDialog" class="teal--text font-weight-bold" rounded color="#EEEEEE" dark>OK</v-btn>
      </div>
    </div>
  </v-dialog>
</template>

<script>
  export default {
    name: 'InformationDialog',
    props: {
      informationDialogVisibility: Boolean,
      information: String
    },
    methods: {
      closeInformationDialog () {
        this.$emit('closeInformationDialog', { informationDialogVisibility: false, informationDialogText: null })
        if (this.information === 'Aplikacja została zaktualizowana.') {
          window.location.reload(true)
        }
      }
    },
    computed: {
      informationDialogWidth () {
        if (this.$vuetify.breakpoint.xsOnly) {
          return 70 + '%'
        } else {
          return 30 + '%'
        }
      }
    }
  }
</script>

<style scoped>

</style>
