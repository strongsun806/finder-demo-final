// src/pages/Company.tsx
import React from "react";

type CompanyStatus = "사용 중" | "중지" | "체험";

type Company = {
  id: number;
  name: string;
  businessNo: string;
  managerName: string;
  managerPhone: string;
  managerEmail: string;
  createdAt: string; // "2023-10-10"
  status: CompanyStatus;
  contractType: string;
  memo?: string;
  logoUrl?: string; // 미리보기용
};

const initialCompanies: Company[] = [
  {
    id: 1,
    name: "동동물류(주)",
    businessNo: "123-45-67890",
    managerName: "김물류",
    managerPhone: "010-1234-5678",
    managerEmail: "logistics@example.com",
    createdAt: "2023-09-01",
    status: "사용 중",
    contractType: "정식 서비스",
    memo: "부산항 컨테이너 야드 운영사",
  },
  {
    id: 2,
    name: "해운글로벌",
    businessNo: "234-56-78901",
    managerName: "박해운",
    managerPhone: "010-2345-6789",
    managerEmail: "shipping@example.com",
    createdAt: "2023-10-05",
    status: "체험",
    contractType: "PoC / 체험",
    memo: "체험 기간 중 야드 관리 모듈만 사용",
  },
  {
    id: 3,
    name: "항만터미널(주)",
    businessNo: "345-67-89012",
    managerName: "이터미널",
    managerPhone: "010-3456-7890",
    managerEmail: "terminal@example.com",
    createdAt: "2023-08-20",
    status: "중지",
    contractType: "정식 서비스",
    memo: "계약 해지(2023-12 예정)",
  },
];

export default function CompanyPage() {
  const [companies, setCompanies] =
    React.useState<Company[]>(initialCompanies);

  const [selected, setSelected] =
    React.useState<Company | null>(null);
  const [openCreate, setOpenCreate] =
    React.useState(false);

  // 신규 등록 폼
  const [createForm, setCreateForm] =
    React.useState<CompanyFormState>({
      name: "",
      businessNo: "",
      managerName: "",
      managerPhone: "",
      managerEmail: "",
      status: "사용 중",
      contractType: "정식 서비스",
      memo: "",
      logoFile: null,
      logoPreview: "",
    });

  const handleOpenDetail = (company: Company) => {
    setSelected(company);
  };

  const handleCreateChange = (
    field: keyof CompanyFormState,
    value: string | File | null
  ) => {
    setCreateForm((prev) => ({
      ...prev,
      [field]: value as any,
    }));
  };

  const handleCreateSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!createForm.name.trim()) {
      alert("회사명을 입력하세요.");
      return;
    }
    if (!createForm.businessNo.trim()) {
      alert("사업자번호를 입력하세요.");
      return;
    }

    let logoUrl: string | undefined;
    if (createForm.logoFile) {
      logoUrl = URL.createObjectURL(createForm.logoFile);
    }

    const newCompany: Company = {
      id:
        Math.max(0, ...companies.map((c) => c.id)) + 1,
      name: createForm.name.trim(),
      businessNo: createForm.businessNo.trim(),
      managerName: createForm.managerName.trim(),
      managerPhone: createForm.managerPhone.trim(),
      managerEmail: createForm.managerEmail.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
      status: createForm.status,
      contractType: createForm.contractType.trim() || "정식 서비스",
      memo: createForm.memo.trim() || undefined,
      logoUrl,
    };

    setCompanies((prev) => [newCompany, ...prev]);
    // 폼 리셋
    if (createForm.logoPreview) {
      URL.revokeObjectURL(createForm.logoPreview);
    }
    setCreateForm({
      name: "",
      businessNo: "",
      managerName: "",
      managerPhone: "",
      managerEmail: "",
      status: "사용 중",
      contractType: "정식 서비스",
      memo: "",
      logoFile: null,
      logoPreview: "",
    });
    setOpenCreate(false);
  };

  return (
    <div className="space-y-4">
      {/* 설명 */}
      <div className="text-[13px] text-slate-500">
        FINDER ER를 사용하는 기업 정보를 등록·관리합니다.
        계약 정보와 담당자 정보를 확인할 수 있습니다.
      </div>

      {/* 기업 목록 카드 */}
      <div className="card p-5">
        <div className="card-header">
          <div>
            <div className="card-title">
              등록된 기업 목록
            </div>
            <div className="card-subtitle">
              FINDER ER를 사용하는 기업과 계약 현황을
              조회합니다.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            className="px-4 py-1.5 rounded-full bg-[#003388] text-white text-[12px] font-semibold hover:bg-[#002266]"
          >
            기업 등록
          </button>
        </div>

        <div className="mt-2 border rounded-xl overflow-hidden">
          {/* 헤더 */}
          <div className="grid grid-cols-[2.6fr,1.7fr,1.5fr,1.5fr,1fr,0.9fr] bg-slate-50 border-b text-[12px] text-slate-500">
            <div className="px-4 py-2">회사명</div>
            <div className="px-4 py-2">사업자번호</div>
            <div className="px-4 py-2 text-center">
              담당자
            </div>
            <div className="px-4 py-2 text-center">
              연락처
            </div>
            <div className="px-4 py-2 text-center">
              사용 상태
            </div>
            <div className="px-4 py-2 text-center">
              상세
            </div>
          </div>

          {/* 바디 */}
          <div className="divide-y text-[12px]">
            {companies.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[2.6fr,1.7fr,1.5fr,1.5fr,1fr,0.9fr] bg-white hover:bg-slate-50"
              >
                <button
                  type="button"
                  className="px-4 py-2 text-left truncate"
                  onClick={() => handleOpenDetail(c)}
                >
                  <span className="mr-2 text-slate-700">
                    {c.name}
                  </span>
                </button>
                <div className="px-4 py-2 flex items-center text-slate-600">
                  {c.businessNo}
                </div>
                <div className="px-4 py-2 flex items-center justify-center">
                  {c.managerName}
                </div>
                <div className="px-4 py-2 flex items-center justify-center">
                  {c.managerPhone}
                </div>
                <div className="px-4 py-2 flex items-center justify-center">
                  <CompanyStatusBadge status={c.status} />
                </div>
                <div className="px-4 py-2 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(c)}
                    className="px-3 py-1 rounded-full border text-[11px] text-slate-700 hover:bg-slate-50"
                  >
                    상세
                  </button>
                </div>
              </div>
            ))}
            {companies.length === 0 && (
              <div className="px-4 py-6 text-center text-slate-400">
                등록된 기업이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 상세 모달 */}
      {selected && (
        <CompanyDetailModal
          company={selected}
          onClose={() => setSelected(null)}
          onSave={(updated) => {
            setCompanies((prev) =>
              prev.map((c) =>
                c.id === updated.id ? updated : c
              )
            );
            setSelected(updated);
          }}
        />
      )}

      {/* 등록 모달 */}
      {openCreate && (
        <CompanyCreateModal
          form={createForm}
          onChange={handleCreateChange}
          onClose={() => setOpenCreate(false)}
          onSubmit={handleCreateSubmit}
        />
      )}
    </div>
  );
}

/* ------------------------------
   상태 뱃지
------------------------------ */

function CompanyStatusBadge({
  status,
}: {
  status: CompanyStatus;
}) {
  let cls =
    "px-2 py-0.5 rounded-full text-[11px] inline-flex items-center justify-center";
  if (status === "사용 중") {
    cls += " bg-emerald-50 text-emerald-700";
  } else if (status === "체험") {
    cls += " bg-sky-50 text-sky-700";
  } else {
    cls += " bg-slate-50 text-slate-500";
  }
  return <span className={cls}>{status}</span>;
}

/* ------------------------------
   상세 모달
------------------------------ */

type CompanyFormState = {
  name: string;
  businessNo: string;
  managerName: string;
  managerPhone: string;
  managerEmail: string;
  status: CompanyStatus;
  contractType: string;
  memo: string;
  logoFile: File | null;
  logoPreview: string; // Object URL
};

function CompanyDetailModal({
  company,
  onClose,
  onSave,
}: {
  company: Company;
  onClose: () => void;
  onSave: (c: Company) => void;
}) {
  const [form, setForm] =
    React.useState<CompanyFormState>({
      name: company.name,
      businessNo: company.businessNo,
      managerName: company.managerName,
      managerPhone: company.managerPhone,
      managerEmail: company.managerEmail,
      status: company.status,
      contractType: company.contractType,
      memo: company.memo ?? "",
      logoFile: null,
      logoPreview: company.logoUrl ?? "",
    });

  const handleChange = (
    field: keyof CompanyFormState,
    value: string | File | null
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value as any,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      if (form.logoPreview) {
        URL.revokeObjectURL(form.logoPreview);
      }
      setForm((prev) => ({
        ...prev,
        logoFile: null,
        logoPreview: company.logoUrl ?? "",
      }));
      return;
    }
    if (form.logoPreview && form.logoPreview !== company.logoUrl) {
      URL.revokeObjectURL(form.logoPreview);
    }
    const previewUrl = URL.createObjectURL(file);
    setForm((prev) => ({
      ...prev,
      logoFile: file,
      logoPreview: previewUrl,
    }));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    const updated: Company = {
      ...company,
      name: form.name.trim(),
      businessNo: form.businessNo.trim(),
      managerName: form.managerName.trim(),
      managerPhone: form.managerPhone.trim(),
      managerEmail: form.managerEmail.trim(),
      status: form.status,
      contractType: form.contractType.trim() || "정식 서비스",
      memo: form.memo.trim() || undefined,
      logoUrl: form.logoPreview || company.logoUrl,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-soft w-full max-w-3xl border border-slate-200">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="text-[13px] font-semibold">
            기업 정보 상세 / 수정
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] text-slate-500 hover:text-slate-700"
          >
            닫기
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-6 py-4 space-y-4 text-[12px]"
        >
          {/* 상단: 로고 + 회사 기본정보 */}
          <div className="grid grid-cols-[1.6fr,2.4fr] gap-6">
            {/* 로고 영역 */}
            <div className="flex flex-col items-center">
              <div className="w-full mb-2 text-[11px] text-slate-500">
                회사 로고
              </div>
              <div className="w-full h-40 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                {form.logoPreview || company.logoUrl ? (
                  <img
                    src={
                      form.logoPreview || company.logoUrl
                    }
                    alt="Company logo"
                    className="max-h-full object-contain"
                  />
                ) : (
                  <span className="text-slate-400 text-[11px]">
                    등록된 로고가 없습니다.
                  </span>
                )}
              </div>
              <div className="mt-2 flex w-full justify-between items-center gap-2">
                <label className="inline-flex items-center px-3 h-8 rounded-lg border border-slate-300 bg-white text-[12px] text-slate-700 cursor-pointer hover:bg-slate-50">
                  로고 변경
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                <span className="text-[11px] text-slate-400">
                  2MB 이하 PNG/JPEG 권장
                </span>
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="space-y-2">
              <div>
                <div className="text-[11px] text-slate-500 mb-1">
                  회사명
                </div>
                <input
                  value={form.name}
                  onChange={(e) =>
                    handleChange("name", e.target.value)
                  }
                  className="w-full h-8 rounded-lg border border-slate-300 px-3 text-[12px] outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 mb-1">
                  사업자번호
                </div>
                <input
                  value={form.businessNo}
                  onChange={(e) =>
                    handleChange(
                      "businessNo",
                      e.target.value
                    )
                  }
                  className="w-full h-8 rounded-lg border border-slate-300 px-3 text-[12px] outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="000-00-00000"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] text-slate-500 mb-1">
                    사용 상태
                  </div>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      handleChange(
                        "status",
                        e.target.value as CompanyStatus
                      )
                    }
                    className="w-full h-8 rounded-lg border border-slate-300 px-2 text-[12px] outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="사용 중">
                      사용 중
                    </option>
                    <option value="체험">체험</option>
                    <option value="중지">중지</option>
                  </select>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 mb-1">
                    계약 유형
                  </div>
                  <input
                    value={form.contractType}
                    onChange={(e) =>
                      handleChange(
                        "contractType",
                        e.target.value
                      )
                    }
                    className="w-full h-8 rounded-lg border border-slate-300 px-3 text-[12px] outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="정식 서비스 / PoC 등"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 하단: 담당자 / 메모 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div>
                <div className="text-[11px] text-slate-500 mb-1">
                  담당자 이름
                </div>
                <input
                  value={form.managerName}
                  onChange={(e) =>
                    handleChange(
                      "managerName",
                      e.target.value
                    )
                  }
                  className="w-full h-8 rounded-lg border border-slate-300 px-3 text-[12px] outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 mb-1">
                  담당자 연락처
                </div>
                <input
                  value={form.managerPhone}
                  onChange={(e) =>
                    handleChange(
                      "managerPhone",
                      e.target.value
                    )
                  }
                  className="w-full h-8 rounded-lg border border-slate-300 px-3 text-[12px] outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="010-0000-0000"
                />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 mb-1">
                  담당자 이메일
                </div>
                <input
                  value={form.managerEmail}
                  onChange={(e) =>
                    handleChange(
                      "managerEmail",
                      e.target.value
                    )
                  }
                  className="w-full h-8 rounded-lg border border-slate-300 px-3 text-[12px] outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="example@company.com"
                />
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 mb-1">
                메모
              </div>
              <textarea
                value={form.memo}
                onChange={(e) =>
                  handleChange("memo", e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[12px] outline-none focus:ring-1 focus:ring-sky-500 min-h-[120px] resize-none"
                placeholder="계약 조건, 특이사항 등을 기록하세요."
              />
            </div>
          </div>

          <div className="pt-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-[12px] rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded-full bg-[#003388] text-white text-[12px] font-semibold hover:bg-[#002266]"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------
   등록 모달
------------------------------ */

function CompanyCreateModal({
  form,
  onChange,
  onClose,
  onSubmit,
}: {
  form: CompanyFormState;
  onChange: (
    field: keyof CompanyFormState,
    value: string | File | null
  ) => void;
  onClose: () => void;
  onSubmit: (e?: React.FormEvent) => void;
}) {
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      if (form.logoPreview) {
        URL.revokeObjectURL(form.logoPreview);
      }
      onChange("logoFile", null);
      onChange("logoPreview", "");
      return;
    }
    if (form.logoPreview) {
      URL.revokeObjectURL(form.logoPreview);
    }
    const previewUrl = URL.createObjectURL(file);
    onChange("logoFile", file);
    onChange("logoPreview", previewUrl);
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-soft w-full max-w-3xl border border-slate-200">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="text-[13px] font-semibold">
            기업 등록
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] text-slate-500 hover:text-slate-700"
          >
            닫기
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="px-6 py-4 space-y-4 text-[12px]"
        >
          <div className="grid grid-cols-[1.6fr,2.4fr] gap-6">
            {/* 로고 영역 */}
            <div className="flex flex-col items-center">
              <div className="w-full mb-2 text-[11px] text-slate-500">
                회사 로고
              </div>
              <div className="w-full h-40 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                {form.logoPreview ? (
                  <img
                    src={form.logoPreview}
                    alt="Company logo preview"
                    className="max-h-full object-contain"
                  />
                ) : (
                  <span className="text-slate-400 text-[11px]">
                    로고 이미지를 등록하세요.
                  </span>
                )}
              </div>
              <div className="mt-2 flex w-full justify-between items-center gap-2">
                <label className="inline-flex items-center px-3 h-8 rounded-lg border border-slate-300 bg-white text-[12px] text-slate-700 cursor-pointer hover:bg-slate-50">
                  파일 선택
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                <span className="text-[11px] text-slate-400">
                  2MB 이하 PNG/JPEG 권장
                </span>
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="space-y-2">
              <div>
                <div className="text-[11px] text-slate-500 mb-1">
                  회사명
                </div>
                <input
                  value={form.name}
                  onChange={(e) =>
                    onChange("name", e.target.value)
                  }
                  className="w-full h-8 rounded-lg border border-slate-300 px-3 text-[12px] outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="회사명을 입력하세요"
                />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 mb-1">
                  사업자번호
                </div>
                <input
                  value={form.businessNo}
                  onChange={(e) =>
                    onChange(
                      "businessNo",
                      e.target.value
                    )
                  }
                  className="w-full h-8 rounded-lg border border-slate-300 px-3 text-[12px] outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="000-00-00000"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] text-slate-500 mb-1">
                    사용 상태
                  </div>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      onChange(
                        "status",
                        e.target.value as CompanyStatus
                      )
                    }
                    className="w-full h-8 rounded-lg border border-slate-300 px-2 text-[12px] outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="사용 중">
                      사용 중
                    </option>
                    <option value="체험">체험</option>
                    <option value="중지">중지</option>
                  </select>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 mb-1">
                    계약 유형
                  </div>
                  <input
                    value={form.contractType}
                    onChange={(e) =>
                      onChange(
                        "contractType",
                        e.target.value
                      )
                    }
                    className="w-full h-8 rounded-lg border border-slate-300 px-3 text-[12px] outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="정식 서비스 / PoC 등"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 하단: 담당자 / 메모 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div>
                <div className="text-[11px] text-slate-500 mb-1">
                  담당자 이름
                </div>
                <input
                  value={form.managerName}
                  onChange={(e) =>
                    onChange(
                      "managerName",
                      e.target.value
                    )
                  }
                  className="w-full h-8 rounded-lg border border-slate-300 px-3 text-[12px] outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 mb-1">
                  담당자 연락처
                </div>
                <input
                  value={form.managerPhone}
                  onChange={(e) =>
                    onChange(
                      "managerPhone",
                      e.target.value
                    )
                  }
                  className="w-full h-8 rounded-lg border border-slate-300 px-3 text-[12px] outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="010-0000-0000"
                />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 mb-1">
                  담당자 이메일
                </div>
                <input
                  value={form.managerEmail}
                  onChange={(e) =>
                    onChange(
                      "managerEmail",
                      e.target.value
                    )
                  }
                  className="w-full h-8 rounded-lg border border-slate-300 px-3 text-[12px] outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="example@company.com"
                />
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 mb-1">
                메모
              </div>
              <textarea
                value={form.memo}
                onChange={(e) =>
                  onChange("memo", e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[12px] outline-none focus:ring-1 focus:ring-sky-500 min-h-[120px] resize-none"
                placeholder="계약 조건, 특이사항 등을 기록하세요."
              />
            </div>
          </div>

          <div className="pt-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-[12px] rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded-full bg-[#003388] text-white text-[12px] font-semibold hover:bg-[#002266]"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
