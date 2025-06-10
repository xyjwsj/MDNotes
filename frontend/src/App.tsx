import {
  CreateLicense,
  Trial,
} from "@/bindings/changeme/handler/systemhandler.ts";
import { settingInfoStore } from "@/store/modules/settings.ts";
import { TipError, TipWarning } from "@/util/messageUtil.tsx";
import {ModalView, ShowModal} from "@/util/modalUtil.tsx";
import { Input } from "ant-design-vue";
import { defineComponent, onMounted, provide, ref } from "vue";
import { useI18n } from "vue-i18n";
import { RouterView } from "vue-router";
import styled from "vue3-styled-components";

export default defineComponent({
  setup() {
    const { t, locale } = useI18n();

    const RootView = styled.div`
      width: 100vw;
      height: 850px;
      position: relative; /* 设置相对定位，以便伪元素可以相对于此元素定位 */
      background-color: ${() =>
        settingInfoStore.DarkTheme() ? "rgba(0, 0, 0, 0.8)" : "white"};

      > * {
        position: relative;
        z-index: 2; /* 确保子元素在伪元素之上 */
      }

      .settingDialog {
        background: transparent;
        //内容

        :global(.ant-modal-content) {
          background-color: rgba(0, 0, 0, 0.1) !important;
          border-radius: 5px !important;
          //width: 350px !important;

          .ant-modal-header {
            //background: transparent !important;
            border-radius: 0 !important;
          }

          :global(.ant-modal-title) {
            color: gray !important;
            background-color: rgba(0, 0, 0, 0.1) !important;
          }
        }
      }
    `;

    const InputView = styled(Input)`
      background-color: ${() =>
        settingInfoStore.DarkTheme()
          ? "rgba(255, 255, 255, 0.2)"
          : "rgba(255, 255, 255, 0.6)"};
      margin: 5px 0;
      color: ${() =>
        settingInfoStore.DarkTheme() ? "rgba(255, 255, 255, 0.8)" : "gray"};

      .ant-input {
        &::placeholder {
          color: ${() =>
            settingInfoStore.DarkTheme() ? "rgba(255, 255, 255, 0.4)" : "gray"};
        }
      }

      &:hover {
        background-color: ${() =>
          settingInfoStore.DarkTheme()
            ? "rgba(255, 255, 255, 0.4)"
            : "#fafafa"};
      }

      &:focus {
        background-color: ${() =>
          settingInfoStore.DarkTheme() ? "rgba(255, 255, 255, 0.4)" : "white"};
      }
    `;

    const rootRef = ref<any>(null);

    onMounted(() => {
      locale.value = settingInfoStore.getState().lang || "zh";
    });

    const LicenseView = styled.div`
      display: flex;
      flex-direction: column;
      gap: 5px;
    `;

    const showLicense = async (ok?: () => void) => {
      const licenseInfo = await Trial(false);

      const license = ref("");

      const modalView = new ModalView();
      modalView.width = "50%";
      modalView.title = t("license");
      if (licenseInfo.content === "") {
        modalView.cancelText = t("trial");
        modalView.okText = t("validate");
      } else {
        if (licenseInfo.type === "production") {
          modalView.okText = "";
          modalView.cancelText = "";
        }
        if (licenseInfo.type === "trial") {
          modalView.okText = t("validate");
          modalView.cancelText = "";
        }
      }
      modalView.closed = true;
      modalView.content = (
        <LicenseView>
          {licenseInfo.deviceId !== "" && (
            <span
              style={{
                color: settingInfoStore.DarkTheme() ? "lightgray" : "gray",
              }}
            >{`${t("uniqueId")}：${licenseInfo.deviceId}`}</span>
          )}
          {modalView.okText !== "" && (
            <InputView
              class={"inputC"}
              bordered={false}
              placeholder={t("input") + t("license")}
              defaultValue={license.value}
              onChange={(e) => (license.value = e.target.value!)}
            ></InputView>
          )}
          <span
            style={{
              color: settingInfoStore.DarkTheme() ? "lightgray" : "gray",
            }}
          >{`${t("licenseTip")}：xyjwsj`}</span>
          {licenseInfo.content !== "" && (
            <span
              style={{
                color: settingInfoStore.DarkTheme() ? "lightgray" : "gray",
              }}
            >{`${t("licenseExpired")} ${licenseInfo.content}`}</span>
          )}
        </LicenseView>
      );
      modalView.cancelCall = async () => {
        const res = await Trial(true);
        if (res.content === "") {
          TipError(t("trialEnd"));
          return false;
        }
        if (ok) {
          ok();
        }
        return true;
      };
      modalView.okCall = async () => {
        if (license.value === "") {
          TipWarning(t("input") + t("license"));
          return false;
        }
        let createLicense = await CreateLicense(license.value);
        if (createLicense) {
          TipWarning(t("success"));
        } else {
          TipError(t("licenseIncorrect"));
        }
        if (ok) {
          ok();
        }
        return createLicense;
      };

      // modalView.show();
      ShowModal(modalView)
    };

    provide("showLicense", showLicense);

    return () => (
      <RootView>
        <RouterView ref={(e) => (rootRef.value = e)} />
      </RootView>
    );
  },
});
