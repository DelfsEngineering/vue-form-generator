<template>
	<img :src="mapLink" />
</template>

<script>
import abstractField from "../abstractField";
import { defaults, isObject } from "lodash";

export default {
	name: "FieldStaticmap",
	mixins: [abstractField],

	computed: {
		mapLink() {
			if (this.value) {
				let lat, lng;
				let options = defaults(this.fieldOptions, {
					lat: "lat",
					lng: "lng",
					zoom: 8,
					sizeX: 640,
					sizeY: 640
				});

				if (options.autoDetectSchema && isObject(this.value) && this.value.lat && this.value.lng) {
					lat = this.value.lat;
					lng = this.value.lng;
				} else {
					let LL = String(this.value).split(",");
					if (LL.length === 2) {
						lat = LL[0];
						lng = LL[1];
					} else {
						// Use address
					}
				}

				let url = `http://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${options.zoom}&size=${options.sizeX}x${options.sizeY}`;

				let props = [
					"scale",
					"format",
					"maptype",
					"language",
					"region",
					"markers",
					"path",
					"visible",
					"style",
					"key",
					"signature"
				];
				for (let prop of props) {
					if (typeof options[prop] !== "undefined") {
						url += `&${prop}=${options[prop]}`;
					}
				}
				if (lat && lng) {
					return url;
				}
			} else {
				return null; // Ensure a value is always returned
			}
		}
	}
};
</script>

<style lang="scss">
.vue-form-generator .field-staticMap img {
	display: block;
	width: auto;
	max-width: 100%;
}
</style>
