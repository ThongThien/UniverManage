import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ref, get, update } from "firebase/database";
import { database } from "../../firebase";

const AddUniversityModal = ({
  isVisible,
  onCancel,
  updateFilteredDataSource,
  isAdding,
  isEditing,
  editValue,
}) => {
  const [form] = Form.useForm();
  const [universityCode, setUniversityCode] = useState("");
  const [universityName, setUniversityName] = useState("");
  const [universityAddress, setUniversityAddress] = useState("");
  const [universityScore, setUniversityScore] = useState("");
  const [universityEntranceNumber, setUniversityEntranceNumber] = useState("");
  const { t } = useTranslation(["universitymanager"]);
  const [confirmSubmitVisible, setConfirmSubmitVisible] = useState(false);
  const [confirmClearVisible, setConfirmClearVisible] = useState(false);
  const [universityCodeError, setUniversityCodeError] = useState(false);
  const [universityNameError, setUniversityNameError] = useState(false);
  const [universityAddressError, setUniversityAddressError] = useState(false);
  const [universityScoreError, setUniversityScoreError] = useState(false);
  const [universityEntranceNumberError, setUniversityEntranceNumberError] =
    useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [editFormValues, setEditFormValues] = useState({});
  const [universityCodeExists, setUniversityCodeExists] = useState(false);
  const [universityNameExists, setUniversityNameExists] = useState(false);

  useEffect(() => {
    if (editValue) {
      setEditFormValues({
        address: editValue.address,
        admissionCutoffScore: editValue.admissionCutoffScore,
        entranceNumber: editValue.entranceNumber,
      });
      form.setFieldsValue({
        address: editValue.address,
        admissionCutoffScore: editValue.admissionCutoffScore,
        entranceNumber: editValue.entranceNumber,
      });
    }
  }, [editValue, form]);

  const handleSubmit = async () => {
    try {
      const newUniversityData = {
        id: universityCode,
        name: universityName,
        address: universityAddress,
        admissionCutoffScore: universityScore,
        entranceNumber: universityEntranceNumber,
        studentsRegistered: [],
      };

      await update(
        ref(database, `universities/${universityCode}`),
        newUniversityData
      );
      setUniversityName("");
      setUniversityAddress("");
      setUniversityScore("");
      setUniversityEntranceNumber("");
      setUniversityCode("");
      updateFilteredDataSource(newUniversityData);
      handleCancel();
    } catch (error) {
      toast.error(t("errorAddingUniversity"), error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };
  const showSubmitConfirm = () => {
    try {
      form.validateFields();
      setConfirmSubmitVisible(true);
    } catch (error) {
      toast.error(t("pleaseFillInAllRequiredFieldsCorrectly"));
    }
  };
  const hideSubmitConfirm = () => setConfirmSubmitVisible(false);
  const showClearConfirm = () => setConfirmClearVisible(true);
  const hideClearConfirm = () => setConfirmClearVisible(false);
  const handleConfirmSubmit = () => {
    handleSubmit();
    handleClear();
    hideSubmitConfirm();
    toast.success(t("newUniAddedSuccessfully"));
  };
  const handleConfirmClear = () => {
    handleClear();
    hideClearConfirm();
  };
  const handleClear = () => {
    setUniversityName("");
    setUniversityAddress("");
    setUniversityScore("");
    setUniversityEntranceNumber("");
    form.resetFields();

    if (isEditing) {
      setEditFormValues({
        address: editValue.address,
        admissionCutoffScore: editValue.admissionCutoffScore,
        entranceNumber: editValue.entranceNumber,
      });
      form.setFieldsValue({
        address: editValue.address,
        admissionCutoffScore: editValue.admissionCutoffScore,
        entranceNumber: editValue.entranceNumber,
      });
    }
  };

  const handleSaveConfirm = () => {
    Modal.confirm({
      title: t("areYouSureYouWantToSave"),
      okText: t("yes"),
      cancelText: t("no"),
      onOk: async () => {
        handleSave();
      },
    });
  };

  const handleSave = async () => {
    try {
      if (editValue && editValue.id) {
        const uniKey = `${editValue.id}`;

        editValue.address = editFormValues.address;
        editValue.admissionCutoffScore = editFormValues.admissionCutoffScore;
        editValue.entranceNumber = editFormValues.entranceNumber;

        const uniRef = ref(database, `universities/${uniKey}`);
        await update(uniRef, editValue);
        toast.success(t("editSuccessfully"));
        updateFilteredDataSource(editValue);
        handleCancel();
      } else {
        toast.error(t("noValidUniversityIDFoundForEditing"));
      }
    } catch (error) {
      toast.error(t("errorUpdatingUniversityInfo"), error);
    }
  };
  return (
    <Modal
      title={isAdding ? t("addUniversity") : t("editUniversity")}
      open={isVisible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {t("cancel")}
        </Button>,
        <Button key="clear" onClick={showClearConfirm}>
          {t("clear")}
        </Button>,

        <Button
          form="addUniversityForm"
          key="submit"
          type="primary"
          htmlType="submit"
          onClick={isEditing ? handleSaveConfirm : showSubmitConfirm}
          disabled={
            (isAdding &&
              (universityCodeError ||
                universityNameError ||
                universityAddressError ||
                universityScoreError ||
                universityEntranceNumberError ||
                !universityCode ||
                !universityName ||
                !universityAddress ||
                !universityScore ||
                (universityCodeExists && !isEditing) ||
                (universityNameExists && !isEditing) ||
                !universityEntranceNumber)) ||
            (isEditing &&
              (universityAddressError ||
                universityScoreError ||
                hasErrors ||
                universityEntranceNumberError ||
                !editFormValues.address ||
                !editFormValues.admissionCutoffScore ||
                !editFormValues.entranceNumber ||
                editValue?.studentsRegistered?.length >
                  editFormValues.entranceNumber ||
                editFormValues.admissionCutoffScore >
                  editValue.admissionCutoffScore))
          }
        >
          {isEditing ? t("update") : t("submit")}
        </Button>,
      ]}
    >
      <Form id="addUniversityForm" form={form}>
        <div className="modal-content">
          {isAdding && (
            <>
              <Form.Item
                label={t("universityCode")}
                name="universityCode"
                rules={[
                  { required: true, message: t("pleaseEnterUniversityCode") },
                  { pattern: /^[A-Z]{3}$/, message: t("universityCodeFormat") },
                  {
                    validator: async (_, value) => {
                      const universitiesRef = ref(database, "universities");
                      const snapshot = await get(universitiesRef);
                      const universitiesData = snapshot.val();
                      if (universitiesData) {
                        const universityCodes = Object.keys(universitiesData);
                        if (universityCodes.includes(value)) {
                          setUniversityCodeExists(true);
                          return Promise.reject(t("universityCodeExists"));
                        }
                      }
                      setUniversityCodeExists(false);
                      return Promise.resolve();
                    },
                  },
                ]}
                labelAlign="left"
                labelCol={{ span: 24 }}
              >
                <Input
                  placeholder={t("pleaseEnterUniversityCode")}
                  autoComplete="off"
                  value={universityCode}
                  onChange={(e) => {
                    setUniversityCode(e.target.value);
                    setUniversityCodeError(!/^[A-Z]{3}$/.test(e.target.value));
                  }}
                />
              </Form.Item>

              <Form.Item
                required
                label={t("universityName")}
                name="universityName"
                rules={[
                  {
                    validator: async (_, value) => {
                      if (!value || !/^[a-zA-ZÀ-ỹ\s,.]+$/u.test(value)) {
                        return Promise.reject(
                          new Error(t("pleaseEnterValidUniversityName"))
                        );
                      }

                      const universitiesRef = ref(database, "universities");
                      const snapshot = await get(universitiesRef);
                      const universitiesData = snapshot.val();
                      if (universitiesData) {
                        const universityNames = Object.values(
                          universitiesData
                        ).map((uni) => uni.name);
                        if (universityNames.includes(value)) {
                          setUniversityNameExists(true);
                          return Promise.reject(
                            new Error(t("universityNameExists"))
                          );
                        }
                      }
                      setUniversityNameExists(false);
                      return Promise.resolve();
                    },
                  },
                ]}
                labelAlign="left"
                labelCol={{ span: 24 }}
                style={{ whiteSpace: "pre-line" }}
              >
                <Input
                  placeholder={t("pleaseEnterUniversityName")}
                  autoComplete="off"
                  value={universityName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setUniversityName(value);
                    setUniversityNameError(
                      !value || !/^[a-zA-ZÀ-ỹ\s,.]+$/u.test(value)
                    );
                  }}
                />
              </Form.Item>

              <Form.Item
                label={t("universityAddress")}
                name="universityAddress"
                rules={[
                  {
                    required: true,
                    message: t("pleaseEnterUniversityAddress"),
                    validator: (_, value) => {
                      if (!value.trim()) {
                        setHasErrors(true);

                        return Promise.reject(
                          new Error("University address cannot be only spaces")
                        );
                      }
                      setHasErrors(false);
                      return Promise.resolve();
                    },
                  },
                ]}
                labelAlign="left"
                labelCol={{ span: 24 }}
              >
                <Input
                  placeholder={t("pleaseEnterUniversityAddress")}
                  autoComplete="off"
                  value={universityAddress}
                  onChange={(e) => {
                    setUniversityAddress(e.target.value);
                    setUniversityAddressError(!e.target.value);
                  }}
                />
              </Form.Item>

              <Form.Item
                label={t("universityScore")}
                name="universityScore"
                rules={[
                  { required: true, message: t("pleaseEnterUniversityScore") },
                  {
                    pattern: /^([0-9](\.[0-9]{1,1})?|10)$/,
                    message: t("pleaseEnterAValidNumber"),
                  },
                  // {
                  //   validator: (_, value) => {
                  //     if (value <= 10 && value >= 0) {
                  //       return Promise.resolve();
                  //     }
                  //     return Promise.reject(
                  //       t("pleaseEnterAValueLessThanOrEqualTo10")
                  //     );
                  //   },
                  // },
                ]}
                labelAlign="left"
                labelCol={{ span: 24 }}
              >
                <Input
                  placeholder={t("pleaseEnterUniversityScore")}
                  autoComplete="off"
                  value={universityScore}
                  onChange={(e) => {
                    setUniversityScore(e.target.value);
                    setUniversityScoreError(
                      !/^\d*\.?\d+$/.test(e.target.value) ||
                        e.target.value > 10 ||
                        e.target.value < 0
                    );
                  }}
                />
              </Form.Item>

              <Form.Item
                label={t("universityEntranceNumber")}
                name="universityEntranceNumber"
                rules={[
                  {
                    required: true,
                    message: t("pleaseEnterUniversityEntranceNumber"),
                  },
                  { pattern: /^\d+$/, message: t("entranceNumberMustBeBetween0And9999") },
                  {
                    validator(_, value) {
                      if (value <= 0 || value > 10000) {
                        return Promise.reject(
                          new Error(t("entranceNumberMustBeBetween0And9999"))
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                labelAlign="left"
                labelCol={{ span: 24 }}
              >
                <Input
                  placeholder={t("pleaseEnterUniversityEntranceNumber")}
                  min={0}
                  autoComplete="off"
                  value={universityEntranceNumber}
                  onChange={(e) => {
                    setUniversityEntranceNumber(e.target.value);
                    setUniversityEntranceNumberError(
                      !/^\d+$/.test(e.target.value) || e.target.value <= 0
                    );
                  }}
                />
              </Form.Item>
            </>
          )}
          {isEditing && (
            <>
              <Form.Item label={t("id")} required className="u-manga-box">
                <Input value={editValue?.id} disabled />
              </Form.Item>

              <Form.Item label={t("name")} required className="u-manga-box">
                <Input value={editValue?.name} disabled />
              </Form.Item>

              <Form.Item
                label={t("registeredStudents")}
                required
                className="u-manga-box"
              >
                <Input value={editValue?.registeredStudent} disabled />
              </Form.Item>

              <Form.Item
                className="u-manga-box"
                label={t("address")}
                name="address"
                initialValue={editValue?.address}
                rules={[
                  {
                    required: true,
                    message: t("pleaseEnterUniversityAddress"),
                    validator: (_, value) => {
                      if (!value.trim()) {
                        setHasErrors(true);

                        return Promise.reject(
                          new Error("Address cannot be only spaces")
                        );
                      }
                      setHasErrors(false);

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  className="fix-overlap-css"
                  value={editFormValues.address}
                  onChange={(e) =>
                    setEditFormValues((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />
              </Form.Item>

              <Form.Item
                label={t("admissionCutoffScore")}
                name="admissionCutoffScore"
                className="u-manga-box"
                initialValue={editFormValues.admissionCutoffScore}
                rules={[
                  {
                    validator: (_, value) => {
                      const newScore = parseFloat(value);
                      const oldScore = parseFloat(
                        editValue?.admissionCutoffScore
                      );

                      if (
                        isNaN(newScore) ||
                        !/^([0-9](\.[0-9]{1,1})?|10)$/.test(value)
                      ) {
                        setHasErrors(true);
                        return Promise.reject(
                          new Error(t("validScoreRange", { oldScore }))
                        );
                      }

                      if (newScore > oldScore) {
                        setHasErrors(true);
                        return Promise.reject(
                          new Error(
                            t("scoreMustBeLessOrEqualThan", { oldScore })
                          )
                        );
                      }

                      setHasErrors(false);
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  autoComplete="off"
                  className="fix-overlap-css"
                  value={editFormValues.admissionCutoffScore}
                  onChange={(e) => {
                    setEditFormValues((prev) => ({
                      ...prev,
                      admissionCutoffScore: e.target.value,
                    }));
                  }}
                />
              </Form.Item>

              <Form.Item
                label={t("entranceNumber")}
                name="entranceNumber"
                className="u-manga-box"
                initialValue={editValue?.entranceNumber}
                rules={[
                  {
                    validator(_, value) {
                      const regex = /^[0-9]+$/;

                      if (!regex.test(value)) {
                        setHasErrors(true);
                        return Promise.reject(
                          new Error(t("entranceNumberMustBeNumeric"))
                        );
                      }

                      if (value <= 0 || value > 10000) {
                        setHasErrors(true);
                        return Promise.reject(
                          new Error(t("entranceNumberMustBeBetween1And9999"))
                        );
                      }

                      if (
                        value < (editValue?.studentsRegistered?.length || 0)
                      ) {
                        setHasErrors(true);
                        return Promise.reject(
                          new Error(
                            t(
                              "entranceNumberCannotBeLessThanRegisteredStudents"
                            )
                          )
                        );
                      }
                      setHasErrors(false);
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  className="fix-overlap-css"
                  value={editFormValues.entranceNumber}
                  onChange={(e) =>
                    setEditFormValues((prev) => ({
                      ...prev,
                      entranceNumber: e.target.value,
                    }))
                  }
                />
              </Form.Item>
            </>
          )}
        </div>
      </Form>
      <Modal
        title={t("confirmSubmission")}
        open={confirmSubmitVisible}
        onCancel={hideSubmitConfirm}
        onOk={handleConfirmSubmit}
        okText={t("yes")}
        cancelText={t("cancel")}
      >
        <p>{t("confirmSubmitPrompt")}</p>
      </Modal>

      <Modal
        title={t("confirmClear")}
        open={confirmClearVisible}
        onCancel={hideClearConfirm}
        onOk={handleConfirmClear}
        okText={t("yes")}
        cancelText={t("cancel")}
      >
        <p>{t("confirmClearPrompt")}</p>
      </Modal>
    </Modal>
  );
};

export default AddUniversityModal;
