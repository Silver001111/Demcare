import React, { useState } from 'react';
import { X, Check, Upload, RotateCcw, Camera, User, Building2, Save, Image, ShieldCheck } from 'lucide-react';
import { useAppStore, INITIAL_PATIENT, INITIAL_BRANDING } from '../../store/useAppStore';
import { LanguageCode } from '../../types';
import { t } from '../../translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
}

const REGIONAL_AVATARS = [
  {
    id: 'lakhimi',
    name: 'Lakhimi Baruah',
    description: 'Elderly 71-year-old Assamese grandmother in Muga silk Mekhela Chador',
    url: '/images/lakhimi_baruah.jpg',
    tag: 'Assam Elder (Female)',
  },
  {
    id: 'koka',
    name: 'Bhaben Baruah (Koka)',
    description: 'Elderly 74-year-old Assamese grandfather with traditional Gamosa',
    url: '/images/koka_elder.jpg',
    tag: 'Assam Elder (Male)',
  },
  {
    id: 'moushumi',
    name: 'Moushumi Baruah',
    description: 'Caregiver daughter in Sualkuchi Mekhela Chador',
    url: '/images/caregiver_mouchumi.jpg',
    tag: 'Caregiver (Female)',
  },
];

const LOGO_ICONS = ['🌿', '🧠', '🦏', '🌸', '🍵', '🏔️', '🏥', '🩺', '✨'];

const NER_STATES = [
  'Assam',
  'Meghalaya',
  'Manipur',
  'Mizoram',
  'Tripura',
  'Arunachal Pradesh',
  'Nagaland',
  'Sikkim',
];

export const SettingsCustomizationModal: React.FC<Props> = ({ isOpen, onClose, lang }) => {
  const {
    activePatient,
    customBranding,
    updatePatientProfile,
    updateCustomBranding,
    resetToRegionalDefaults,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'avatar' | 'profile' | 'branding'>('avatar');

  // Form State
  const [photoUrl, setPhotoUrl] = useState(activePatient?.photoUrl || '/images/lakhimi_baruah.jpg');
  const [patientName, setPatientName] = useState(activePatient?.name || '');
  const [age, setAge] = useState(activePatient?.age || 72);
  const [gender, setGender] = useState<'M' | 'F' | 'Other'>(activePatient?.gender || 'F');
  const [state, setState] = useState(activePatient?.state || 'Assam');
  const [district, setDistrict] = useState(activePatient?.district || 'Sonitpur');
  const [village, setVillage] = useState(activePatient?.village || 'Bihaguri Gaon');
  const [abhaId, setAbhaId] = useState(activePatient?.abhaId || '14-8832-1920-4411');
  const [caregiverName, setCaregiverName] = useState(activePatient?.caregiverName || 'Moushumi Baruah');
  const [caregiverPhone, setCaregiverPhone] = useState(activePatient?.caregiverPhone || '+91 94350 12345');

  const [logoIcon, setLogoIcon] = useState(customBranding?.logoIcon || '🌿');
  const [centreName, setCentreName] = useState(customBranding?.centreName || 'Bihaguri Primary Health Centre (Sonitpur)');
  const [appTitle, setAppTitle] = useState(customBranding?.appTitle || 'CogniCare NER');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      alert('File size too large. Please select an image under 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setPhotoUrl(event.target.result);
        showToast('Custom photo loaded! Click Save to apply.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updatePatientProfile({
      photoUrl,
      name: patientName,
      age: Number(age),
      gender,
      state,
      district,
      village,
      abhaId,
      caregiverName,
      caregiverPhone,
    });

    updateCustomBranding({
      logoIcon,
      centreName,
      appTitle,
    });

    showToast('All settings and customizations successfully saved!');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleReset = () => {
    if (window.confirm('Reset all profile photos and branding to authentic North-East regional defaults?')) {
      resetToRegionalDefaults();
      setPhotoUrl(INITIAL_PATIENT.photoUrl);
      setPatientName(INITIAL_PATIENT.name);
      setAge(INITIAL_PATIENT.age);
      setGender(INITIAL_PATIENT.gender);
      setState(INITIAL_PATIENT.state);
      setDistrict(INITIAL_PATIENT.district);
      setVillage(INITIAL_PATIENT.village);
      setAbhaId(INITIAL_PATIENT.abhaId || '14-8832-1920-4411');
      setCaregiverName(INITIAL_PATIENT.caregiverName);
      setCaregiverPhone(INITIAL_PATIENT.caregiverPhone);
      setLogoIcon(INITIAL_BRANDING.logoIcon);
      setCentreName(INITIAL_BRANDING.centreName);
      setAppTitle(INITIAL_BRANDING.appTitle);
      showToast('Reset to regional defaults!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl border-3 border-ner-earth/30 max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b-2 border-ner-sand bg-ner-cream flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl border border-amber-300 shadow-inner">
              ⚙️
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-ner-bark">
                {t('settings_customization', lang)}
              </h2>
              <p className="text-xs text-ner-earth font-medium">
                Customize profile portrait, patient details, and health centre branding
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-ner-sand text-ner-earth transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-ner-sand bg-white px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('avatar')}
            className={`pb-3 px-3 text-xs md:text-sm font-bold flex items-center gap-1.5 border-b-3 transition-all ${
              activeTab === 'avatar'
                ? 'border-ner-earth text-ner-earth'
                : 'border-transparent text-ner-earth/60 hover:text-ner-bark'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{t('profile_photo', lang)}</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-3 text-xs md:text-sm font-bold flex items-center gap-1.5 border-b-3 transition-all ${
              activeTab === 'profile'
                ? 'border-ner-earth text-ner-earth'
                : 'border-transparent text-ner-earth/60 hover:text-ner-bark'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t('patient_profile_tab', lang)}</span>
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`pb-3 px-3 text-xs md:text-sm font-bold flex items-center gap-1.5 border-b-3 transition-all ${
              activeTab === 'branding'
                ? 'border-ner-earth text-ner-earth'
                : 'border-transparent text-ner-earth/60 hover:text-ner-bark'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{t('logo_customization', lang)}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {toastMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* TAB 1: AVATAR & PHOTO */}
          {activeTab === 'avatar' && (
            <div className="space-y-5">
              {/* Current Active Photo */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-ner-cream rounded-2xl border border-ner-sand">
                <div className="relative">
                  <img
                    src={photoUrl}
                    alt="Active Profile"
                    className="w-24 h-24 rounded-2xl object-cover border-3 border-ner-earth shadow-md"
                  />
                  <span className="absolute -bottom-2 -right-2 bg-ner-forest text-white p-1 rounded-full text-xs shadow">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-base font-bold text-ner-bark">{patientName || activePatient?.name}</h3>
                  <p className="text-xs text-ner-earth font-medium mb-3">
                    Active authentic portrait displayed across patient home, clinical charts, and caregiver portals.
                  </p>
                  <label className="btn-tactile bg-white text-ner-bark border-2 border-ner-bark px-4 py-2 text-xs cursor-pointer inline-flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-ner-terracotta" />
                    <span>{t('upload_photo', lang)}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Regional Presets */}
              <div>
                <h4 className="text-xs font-bold text-ner-earth uppercase tracking-wider mb-3">
                  {t('choose_preset', lang)}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {REGIONAL_AVATARS.map((avatar) => {
                    const isSelected = photoUrl === avatar.url;
                    return (
                      <div
                        key={avatar.id}
                        onClick={() => {
                          setPhotoUrl(avatar.url);
                          showToast(`Selected ${avatar.name}!`);
                        }}
                        className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center ${
                          isSelected
                            ? 'bg-amber-50 border-ner-amber ring-2 ring-ner-amber shadow-md'
                            : 'bg-white border-ner-sand hover:border-ner-earth/40 hover:bg-ner-sand/30'
                        }`}
                      >
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden mb-2 shadow-inner">
                          <img
                            src={avatar.url}
                            alt={avatar.name}
                            className="w-full h-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-ner-amber/20 flex items-center justify-center">
                              <span className="bg-ner-earth text-white rounded-full p-1 shadow">
                                <Check className="w-3 h-3" />
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-ner-terracotta uppercase tracking-wide">
                          {avatar.tag}
                        </span>
                        <h5 className="text-xs font-bold text-ner-bark mt-0.5">{avatar.name}</h5>
                        <p className="text-[11px] text-ner-earth mt-1 line-clamp-2 leading-tight">
                          {avatar.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <div className="space-y-4 text-xs font-bold text-ner-earth">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Patient Full Name:</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-ner-sand bg-ner-cream text-sm text-ner-bark font-semibold focus:outline-none focus:border-ner-earth"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1">Age:</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-ner-sand bg-ner-cream text-sm text-ner-bark font-semibold focus:outline-none focus:border-ner-earth"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Gender:</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-ner-sand bg-ner-cream text-sm text-ner-bark font-semibold focus:outline-none focus:border-ner-earth"
                    >
                      <option value="F">Female</option>
                      <option value="M">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1">State (NER):</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-ner-sand bg-ner-cream text-sm text-ner-bark font-semibold focus:outline-none focus:border-ner-earth"
                  >
                    {NER_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">District:</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-ner-sand bg-ner-cream text-sm text-ner-bark font-semibold focus:outline-none focus:border-ner-earth"
                  />
                </div>
                <div>
                  <label className="block mb-1">Village / Gaon:</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-ner-sand bg-ner-cream text-sm text-ner-bark font-semibold focus:outline-none focus:border-ner-earth"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ABHA ID (Ayushman Bharat Health Account):</span>
                </label>
                <input
                  type="text"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  placeholder="14-8832-1920-4411"
                  className="w-full p-2.5 rounded-xl border border-ner-sand bg-ner-cream text-sm font-mono text-ner-bark font-semibold focus:outline-none focus:border-ner-earth"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-ner-sand">
                <div>
                  <label className="block mb-1">Primary Caregiver Name:</label>
                  <input
                    type="text"
                    value={caregiverName}
                    onChange={(e) => setCaregiverName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-ner-sand bg-ner-cream text-sm text-ner-bark font-semibold focus:outline-none focus:border-ner-earth"
                  />
                </div>
                <div>
                  <label className="block mb-1">Caregiver Phone (Emergency WhatsApp):</label>
                  <input
                    type="text"
                    value={caregiverPhone}
                    onChange={(e) => setCaregiverPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-ner-sand bg-ner-cream text-sm text-ner-bark font-semibold focus:outline-none focus:border-ner-earth"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BRANDING */}
          {activeTab === 'branding' && (
            <div className="space-y-4 text-xs font-bold text-ner-earth">
              <div>
                <label className="block mb-1.5">App Logo Icon:</label>
                <div className="flex flex-wrap gap-2">
                  {LOGO_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setLogoIcon(icon)}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl border-2 transition-all ${
                        logoIcon === icon
                          ? 'bg-amber-100 border-ner-amber ring-2 ring-ner-amber scale-110'
                          : 'bg-white border-ner-sand hover:border-ner-earth/40'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-1">Application Title:</label>
                <input
                  type="text"
                  value={appTitle}
                  onChange={(e) => setAppTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ner-sand bg-ner-cream text-sm text-ner-bark font-semibold focus:outline-none focus:border-ner-earth"
                />
              </div>

              <div>
                <label className="block mb-1">Primary Health Centre (PHC) / Hospital Facility:</label>
                <input
                  type="text"
                  value={centreName}
                  onChange={(e) => setCentreName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ner-sand bg-ner-cream text-sm text-ner-bark font-semibold focus:outline-none focus:border-ner-earth"
                />
                <p className="text-[11px] text-ner-earth/70 font-normal mt-1">
                  Appears on official clinical reports, caregiver summaries, and ASHA field logs.
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-3">
                <span className="text-3xl">{logoIcon}</span>
                <div>
                  <h4 className="text-sm font-bold text-ner-bark">{appTitle}</h4>
                  <p className="text-xs text-ner-earth">{centreName}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t-2 border-ner-sand bg-ner-cream flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="btn-tactile bg-white text-ner-bark border border-ner-earth/30 px-3.5 py-2 text-xs flex items-center gap-1.5 hover:bg-ner-sand"
          >
            <RotateCcw className="w-3.5 h-3.5 text-ner-terracotta" />
            <span>{t('reset_defaults', lang)}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-tactile bg-ner-sand text-ner-bark px-4 py-2 text-xs"
            >
              {t('cancel', lang)}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-tactile btn-tactile-green px-5 py-2 text-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{t('save_changes', lang)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
