'use client';

type LocationValue = {
  division: string;
  district: string;
  area: string;
  postalCode: string;
};

type Props = LocationValue & {
  onChange: (value: LocationValue) => void;
};

/*
 * Customer-facing delivery areas.
 * This is intentionally different from a postal-code/thana database.
 * Later each area can have its own delivery zone and charge.
 */

const LOCATION_DATA: Record<
  string,
  {
    division: string;
    areas: string[];
  }
> = {

  Dhaka: {
    division: 'Dhaka',
    areas: [
      'Adabor',
      'Agargaon',
      'Aftabnagar',
      'Azimpur',
      'Badda',
      'Banani',
      'Banani DOHS',
      'Banglamotor',
      'Bangshal',
      'Baridhara',
      'Baridhara DOHS',
      'Bashabo',
      'Bashundhara R/A',
      'Bhatara',
      'Cantonment',
      'Chawkbazar',
      'Dakshinkhan',
      'Demra',
      'Dhanmondi',
      'Farmgate',
      'Gandaria',
      'Gulshan 1',
      'Gulshan 2',
      'Hazaribagh',
      'Jatrabari',
      'Kafrul',
      'Kalabagan',
      'Kamrangirchar',
      'Kawran Bazar',
      'Khilgaon',
      'Khilkhet',
      'Kotwali',
      'Lalbagh',
      'Malibagh',
      'Mirpur 1',
      'Mirpur 2',
      'Mirpur 6',
      'Mirpur 10',
      'Mirpur 11',
      'Mirpur 12',
      'Mirpur 13',
      'Mirpur 14',
      'Mohakhali',
      'Mohakhali DOHS',
      'Mohammadpur',
      'Motijheel',
      'Mugda',
      'New Market',
      'Niketan',
      'Nikunja 1',
      'Nikunja 2',
      'Pallabi',
      'Paltan',
      'Panthapath',
      'Ramna',
      'Rampura',
      'Rayer Bazar',
      'Sabujbagh',
      'Shahbagh',
      'Shahjahanpur',
      'Shantinagar',
      'Shyamoli',
      'Sutrapur',
      'Tejgaon',
      'Tejgaon Industrial Area',
      'Turag',
      'Uttara Sector 1',
      'Uttara Sector 3',
      'Uttara Sector 4',
      'Uttara Sector 5',
      'Uttara Sector 6',
      'Uttara Sector 7',
      'Uttara Sector 9',
      'Uttara Sector 10',
      'Uttara Sector 11',
      'Uttara Sector 12',
      'Uttara Sector 13',
      'Uttara Sector 14',
      'Uttara Sector 15',
      'Uttara Sector 16',
      'Uttara Sector 17',
      'Uttarkhan',
      'Wari',
    ],
  },

  Chattogram: {
    division: 'Chattogram',
    areas: [
      'Agrabad',
      'Anderkilla',
      'Bakalia',
      'Bayezid',
      'Chandgaon',
      'Chawkbazar',
      'Double Mooring',
      'EPZ',
      'Halishahar',
      'Khulshi',
      'Kotwali',
      'Nasirabad',
      'Pahartali',
      'Panchlaish',
      'Patenga',
    ],
  },

  Gazipur: {
    division: 'Dhaka',
    areas: [
      'Gazipur Sadar',
      'Joydebpur',
      'Kaliakair',
      'Kaliganj',
      'Kapasia',
      'Konabari',
      'Sreepur',
      'Tongi',
    ],
  },

  Narayanganj: {
    division: 'Dhaka',
    areas: [
      'Araihazar',
      'Bandar',
      'Fatullah',
      'Narayanganj Sadar',
      'Rupganj',
      'Siddhirganj',
      'Sonargaon',
    ],
  },

  Sylhet: {
    division: 'Sylhet',
    areas: [
      'Ambarkhana',
      'Bandar Bazar',
      'Beanibazar',
      'Chowhatta',
      'Jalalabad',
      'Shahjalal Upashahar',
      'Sylhet Sadar',
      'Zindabazar',
    ],
  },

  Rajshahi: {
    division: 'Rajshahi',
    areas: [
      'Boalia',
      'Motihar',
      'Rajpara',
      'Rajshahi Sadar',
      'Shah Makhdum',
    ],
  },

  Khulna: {
    division: 'Khulna',
    areas: [
      'Daulatpur',
      'Khalishpur',
      'Khulna Sadar',
      'Khan Jahan Ali',
      'Sonadanga',
    ],
  },

  Barishal: {
    division: 'Barishal',
    areas: [
      'Barishal Sadar',
      'Band Road',
      'Nathullabad',
      'Rupatali',
    ],
  },

  Rangpur: {
    division: 'Rangpur',
    areas: [
      'Rangpur Sadar',
      'Jahaj Company',
      'Modern Mor',
      'Shapla Chattar',
    ],
  },

  Mymensingh: {
    division: 'Mymensingh',
    areas: [
      'Mymensingh Sadar',
      'Ganginarpar',
      'Maskanda',
      'Town Hall',
    ],
  },
};


export default function CompactLocationSelector({
  division,
  district,
  area,
  onChange,
}: Props) {

  const districts =
    Object.keys(LOCATION_DATA).sort(
      (a,b) => a.localeCompare(b),
    );

  const areas =
    district
      ? LOCATION_DATA[district]?.areas || []
      : [];


  function changeDistrict(value:string) {

    const item =
      LOCATION_DATA[value];

    onChange({
      division:
        item?.division || '',

      district:value,

      area:'',

      postalCode:'',
    });
  }


  function changeArea(value:string) {

    onChange({
      division,
      district,
      area:value,
      postalCode:'',
    });
  }


  return (
    <div className="grid gap-4 sm:grid-cols-2">

      <label className="text-sm font-bold">

        District

        <select
          required
          value={district}
          onChange={(e) =>
            changeDistrict(e.target.value)
          }
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 font-normal"
        >

          <option value="">
            Select district
          </option>

          {districts.map((name) => (

            <option
              key={name}
              value={name}
            >
              {name}
            </option>

          ))}

        </select>

      </label>


      <label className="text-sm font-bold">

        Area

        <select
          required
          disabled={!district}
          value={area}
          onChange={(e) =>
            changeArea(e.target.value)
          }
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 font-normal disabled:bg-slate-100"
        >

          <option value="">
            {district
              ? 'Select area'
              : 'Select district first'}
          </option>

          {areas.map((name) => (

            <option
              key={name}
              value={name}
            >
              {name}
            </option>

          ))}

        </select>

      </label>

    </div>
  );
}
