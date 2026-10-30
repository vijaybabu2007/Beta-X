import React, { useState } from 'react';
import { 
  Building2, 
  GraduationCap, 
  Layers, 
  Users, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import type { ApplicationType } from '../../types';

interface WizardProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export const NewApplicationWizard: React.FC<WizardProps> = ({ onCancel, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Profile
  const [institutionName, setInstitutionName] = useState('Apex Institute of Technology & Engineering');
  const [aisheCode, setAisheCode] = useState('C-41290');
  const [aictePermanentId, setAictePermanentId] = useState('1-48291039');
  const [applicationType, setApplicationType] = useState<ApplicationType>('EXTENSION_OF_APPROVAL');
  const [academicYear, setAcademicYear] = useState('2025-2026');

  // Step 2: Programs
  const [programs, setPrograms] = useState([
    { programLevel: 'UG', discipline: 'Artificial Intelligence & Machine Learning', existingIntake: 60, proposedIntake: 120, nbaAccredited: true },
    { programLevel: 'UG', discipline: 'Computer Science and Engineering', existingIntake: 180, proposedIntake: 180, nbaAccredited: true },
  ]);

  // Step 3: Infrastructure
  const [landAreaAcres, setLandAreaAcres] = useState(7.5);
  const [instructionalAreaSqm, setInstructionalAreaSqm] = useState(5200);
  const [administrativeAreaSqm, setAdministrativeAreaSqm] = useState(1400);
  const [amenitiesAreaSqm, setAmenitiesAreaSqm] = useState(1100);

  // Step 4: Faculty
  const [totalFacultyCount, setTotalFacultyCount] = useState(48);
  const [phdFacultyCount, setPhdFacultyCount] = useState(18);
  const [totalStudentCount, setTotalStudentCount] = useState(720);

  // Deterministic FSR Formula (APH 2024-27 standard is 1:15 or 1:20)
  const calculatedFsr = totalFacultyCount > 0 
    ? Math.round((totalStudentCount / totalFacultyCount) * 100) / 100 
    : 0;

  const handleAddProgram = () => {
    setPrograms([
      ...programs,
      { programLevel: 'UG', discipline: 'Electronics & Communication', existingIntake: 60, proposedIntake: 60, nbaAccredited: false }
    ]);
  };

  const handleRemoveProgram = (index: number) => {
    setPrograms(programs.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        institutionName,
        aisheCode,
        aictePermanentId,
        applicationType,
        academicYear,
        programIntakes: programs,
        complianceMetric: {
          landAreaAcres,
          instructionalAreaSqm,
          administrativeAreaSqm,
          amenitiesAreaSqm,
          totalFacultyCount,
          phdFacultyCount,
          totalStudentCount,
          calculatedFsr
        }
      };

      await api.applications.create(payload);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application draft. Please check values.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Wizard Header */}
      <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            AICTE Approval Application Intake Wizard (APH 2025-26)
          </h2>
          <p className="text-xs text-slate-300">
            Deterministic Compliance Formulation Engine • Step {currentStep} of 5
          </p>
        </div>
        <button 
          onClick={onCancel}
          className="text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 font-semibold"
        >
          Cancel
        </button>
      </div>

      {/* Progress Stepper Bar */}
      <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
        {[
          { step: 1, label: 'Institution Info', icon: Building2 },
          { step: 2, label: 'Programs & Intake', icon: GraduationCap },
          { step: 3, label: 'Infrastructure Norms', icon: Layers },
          { step: 4, label: 'Faculty & FSR', icon: Users },
          { step: 5, label: 'Review & Submit', icon: CheckCircle2 },
        ].map((item) => {
          const Icon = item.icon;
          const isDone = currentStep > item.step;
          const isCurrent = currentStep === item.step;
          return (
            <div key={item.step} className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isDone 
                  ? 'bg-emerald-600 text-white' 
                  : isCurrent 
                  ? 'bg-blue-700 text-white ring-4 ring-blue-100' 
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : item.step}
              </div>
              <span className={`text-xs font-bold hidden md:inline ${
                isCurrent ? 'text-blue-900' : 'text-slate-500'
              }`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content Canvas */}
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Institution Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-700" />
              1. Institutional Identification & Approval Category
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Institution Legal Name</label>
                <input 
                  type="text" 
                  value={institutionName} 
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Application Type (Cycle 2025-26)</label>
                <select 
                  value={applicationType}
                  onChange={(e) => setApplicationType(e.target.value as ApplicationType)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 font-semibold"
                >
                  <option value="EXTENSION_OF_APPROVAL">Extension of Approval (EOA)</option>
                  <option value="INTAKE_VARIATION">Increase / Variation in Intake</option>
                  <option value="NEW_COURSE">Introduction of New Course / Discipline</option>
                  <option value="NEW_INSTITUTION">Setting up of New Technical Institution</option>
                  <option value="CLOSURE">Closure of Course / Program</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">AISHE Code</label>
                <input 
                  type="text" 
                  value={aisheCode} 
                  onChange={(e) => setAisheCode(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">AICTE Permanent Institute ID</label>
                <input 
                  type="text" 
                  value={aictePermanentId} 
                  onChange={(e) => setAictePermanentId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Programs & Intake */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-700" />
                2. Academic Programs & Proposed Student Intake
              </h3>
              <button
                type="button"
                onClick={handleAddProgram}
                className="px-3 py-1.5 text-xs font-bold text-white bg-blue-700 rounded-lg hover:bg-blue-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Course
              </button>
            </div>

            <div className="space-y-3">
              {programs.map((p, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row items-center gap-3">
                  <div className="w-24">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Level</label>
                    <select
                      value={p.programLevel}
                      onChange={(e) => {
                        const copy = [...programs];
                        copy[idx].programLevel = e.target.value;
                        setPrograms(copy);
                      }}
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="UG">UG</option>
                      <option value="PG">PG</option>
                      <option value="Diploma">Diploma</option>
                    </select>
                  </div>

                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Discipline / Branch</label>
                    <input 
                      type="text"
                      value={p.discipline}
                      onChange={(e) => {
                        const copy = [...programs];
                        copy[idx].discipline = e.target.value;
                        setPrograms(copy);
                      }}
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="w-24">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Sanctioned</label>
                    <input 
                      type="number"
                      value={p.existingIntake}
                      onChange={(e) => {
                        const copy = [...programs];
                        copy[idx].existingIntake = parseInt(e.target.value) || 0;
                        setPrograms(copy);
                      }}
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="w-24">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Proposed</label>
                    <input 
                      type="number"
                      value={p.proposedIntake}
                      onChange={(e) => {
                        const copy = [...programs];
                        copy[idx].proposedIntake = parseInt(e.target.value) || 0;
                        setPrograms(copy);
                      }}
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg font-bold text-blue-900"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => handleRemoveProgram(idx)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Infrastructure Norms */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-700" />
              3. Built-Up Infrastructure & Land Acreage Norms
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1">Total Contiguous Land (Acres)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={landAreaAcres} 
                  onChange={(e) => setLandAreaAcres(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">APH Minimum: 7.5 Acres for Rural / 2.5 Acres for Metro</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1">Instructional Area (Sq. Meters)</label>
                <input 
                  type="number" 
                  value={instructionalAreaSqm} 
                  onChange={(e) => setInstructionalAreaSqm(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white font-bold text-slate-900"
                />
                <p className="text-[11px] text-slate-500 mt-1">Classrooms, Labs, Workshops, Library</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1">Administrative Area (Sq. Meters)</label>
                <input 
                  type="number" 
                  value={administrativeAreaSqm} 
                  onChange={(e) => setAdministrativeAreaSqm(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">Principal Office, Faculty Cabins, Boardroom</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1">Amenities Area (Sq. Meters)</label>
                <input 
                  type="number" 
                  value={amenitiesAreaSqm} 
                  onChange={(e) => setAmenitiesAreaSqm(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">Canteen, Medical Room, Common Rooms</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Faculty & FSR */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-700" />
              4. Faculty Cadre & Faculty-to-Student Ratio (FSR)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Full-Time Faculty</label>
                <input 
                  type="number" 
                  value={totalFacultyCount} 
                  onChange={(e) => setTotalFacultyCount(parseInt(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PhD Qualified Faculty</label>
                <input 
                  type="number" 
                  value={phdFacultyCount} 
                  onChange={(e) => setPhdFacultyCount(parseInt(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Enrolled Students</label>
                <input 
                  type="number" 
                  value={totalStudentCount} 
                  onChange={(e) => setTotalStudentCount(parseInt(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Live Deterministic Compliance Calculation Card */}
            <div className={`p-4 rounded-xl border mt-4 ${
              calculatedFsr <= 15.0 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : calculatedFsr <= 20.0 
                ? 'bg-amber-50 border-amber-200 text-amber-900' 
                : 'bg-red-50 border-red-200 text-red-900'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">Deterministic APH Calculation</p>
                  <p className="text-lg font-black mt-1">Calculated FSR: 1 : {calculatedFsr}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  calculatedFsr <= 15.0 
                    ? 'bg-emerald-200 text-emerald-900' 
                    : calculatedFsr <= 20.0 
                    ? 'bg-amber-200 text-amber-900' 
                    : 'bg-red-200 text-red-900'
                }`}>
                  {calculatedFsr <= 15.0 ? 'Norm Met (1:15 UG Standard)' : calculatedFsr <= 20.0 ? 'Borderline Acceptable' : 'Deficiency Detected'}
                </span>
              </div>
              <p className="text-xs mt-2">
                AICTE APH 2024-27 Clause 7.1 mandates minimum 1:15 FSR for Engineering UG programs.
              </p>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Submit */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              5. Final Application Summary & Statutory Declaration
            </h3>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-slate-500 font-semibold">Institution Name:</span>
                <span className="text-slate-900 font-bold">{institutionName}</span>

                <span className="text-slate-500 font-semibold">Application Type:</span>
                <span className="text-blue-800 font-bold">{applicationType.replace(/_/g, ' ')}</span>

                <span className="text-slate-500 font-semibold">Total Programs Offered:</span>
                <span className="text-slate-900 font-bold">{programs.length} Courses</span>

                <span className="text-slate-500 font-semibold">Calculated FSR:</span>
                <span className="text-emerald-700 font-bold">1 : {calculatedFsr}</span>

                <span className="text-slate-500 font-semibold">Total Land Area:</span>
                <span className="text-slate-900 font-bold">{landAreaAcres} Acres</span>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <strong className="font-bold">Statutory Acknowledgement:</strong> Submitting this draft activates the ReguFlow AI deterministic readiness evaluation engine. All extracted findings are advisory and will be queued for formal Reviewing Officer verification.
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-6">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Previous
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? 'Submitting to Engine...' : 'Generate Readiness Check'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
