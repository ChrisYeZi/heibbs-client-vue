<template>
  <div class="Postbar">
    <!-- 主展示勋章（传奇勋章） -->
    <img
      v-if="medalImage"
      :src="medalImage"
      class="primary-medal"
      title="传奇勋章"
    />
  </div>
</template>

<script lang="ts">
import { ref, watch, defineComponent } from "vue";
import { GetUserPrimaryMedalAPI } from "@/api/index";
import config from "@/config/index";
import { getCachedImage, setCachedImage } from "@/assets/js/imageCache";

export default defineComponent({
  name: "Postbar",
  props: { postObj: { type: Object, default: null } },
  setup(props) {
    const medalImage = ref("");

    const fetchMedal = async (authorid: number) => {
      if (!authorid) return;
      const cacheKey = `medal_${authorid}`
      const cached = getCachedImage(cacheKey)
      if (cached !== null) { medalImage.value = cached; return }
      try {
        const r = await GetUserPrimaryMedalAPI(authorid);
        if (r.status === 200 && r.data && r.data.medalImageUrl) {
          const url = r.data.medalImageUrl;
          const fullUrl = url.startsWith("http") ? url : (config.baseApi + url);
          medalImage.value = fullUrl
          setCachedImage(cacheKey, fullUrl)
        } else {
          medalImage.value = "";
          setCachedImage(cacheKey, "")
        }
      } catch (e) {
        medalImage.value = "";
      }
    };

    watch(
      () => props.postObj?.authorid,
      (newVal) => { if (newVal) fetchMedal(newVal); },
      { immediate: true }
    );

    return { medalImage };
  },
});
</script>

<style lang="scss" scoped>
.Postbar {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}
.primary-medal {
  width: 18px;
  height: 18px;
  border-radius: 3px;
  object-fit: contain;
  margin-left: 3px;
  margin-top: -2px;
  vertical-align: middle;
}
</style>
