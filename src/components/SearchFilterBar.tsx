import type { PatientGender } from '../types/patient';

type SearchFilterBarProps = {
  search: string;
  gender: PatientGender | 'all';
  onSearchChange: (value: string) => void;
  onGenderChange: (value: PatientGender | 'all') => void;
  onCreatePatient: () => void;
};

const SearchFilterBar = ({
  search,
  gender,
  onSearchChange,
  onGenderChange,
  onCreatePatient
}: SearchFilterBarProps): JSX.Element => {
  return (
    <div className="search-filter-bar">
      <label className="visually-hidden" htmlFor="patient-search-input">
        Search patients
      </label>
      <input
        id="patient-search-input"
        type="search"
        value={search}
        placeholder="Search by name, MRN, or email"
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <label className="visually-hidden" htmlFor="gender-filter-select">
        Filter by gender
      </label>
      <select
        id="gender-filter-select"
        value={gender}
        onChange={(event) => onGenderChange(event.target.value as PatientGender | 'all')}
      >
        <option value="all">All genders</option>
        <option value="female">Female</option>
        <option value="male">Male</option>
        <option value="other">Other</option>
        <option value="unknown">Unknown</option>
      </select>
      <button type="button" onClick={onCreatePatient}>
        New patient
      </button>
    </div>
  );
};

export default SearchFilterBar;
