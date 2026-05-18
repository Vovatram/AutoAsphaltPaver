from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from road_repair_system import plan_repair, check_repair

app = FastAPI(title="AutoAsphaltPaver API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Stub data ────────────────────────────────────────────────────────────────

ROADS = [
    {
        "id": 1,
        "name": "102-й километр",
        "coords": [56.390318, 36.571799],
        "polygon": [[56.394373403648885,36.568309446071595],[56.39208458123231,36.57021137350003],[56.38984327766972,36.572114619301786],[56.38771867723379,36.57405653862859],[56.38619508095896,36.575472744988446],[56.386076047422534,36.57517233757876],[56.38899756556469,36.57243765114263],[56.390979272627476,36.57069957970098],[56.392531466748856,36.569406632599666],[56.39431495017981,36.567993449071366]],
        "photo": "https://cdn.discordapp.com/attachments/1440751646526275725/1505657485929873548/1.png?ex=6a0b6c4e&is=6a0a1ace&hm=c4faf58ec905e516b11a712458847082cd90775595189ed33af4d408b82b6385&",
        "lanes": [
            {"id": 1, "name": "Полоса 1", "direction": "На Санкт-Петербург",          "condition": "Удовлетворительное", "last_paved": "2021-03-15"},
            {"id": 2, "name": "Полоса 2", "direction": "На Санкт-Петербург",          "condition": "Плохое",             "last_paved": "2019-08-20"},
            {"id": 3, "name": "Полоса 3", "direction": "На Москву", "condition": "Хорошее",            "last_paved": "2023-01-10"},
            {"id": 4, "name": "Полоса 4", "direction": "На Москву", "condition": "Критическое",        "last_paved": "2015-03-05"},
        ],
        "weather_suitable": True,
        "weather_note": "Температура +18°C, ясно — ремонт возможен",
        "weather_windows": ["08:00–12:00", "14:00–18:00"],
        "repair_hours": 72,
    },
    {
        "id": 2,
        "name": "123-й километр",
        "coords": [56.568796, 36.478926],
        "polygon": [[56.572989586540466,36.47646780557132],[56.56461423631321,36.48100783583993],[56.56464681634025,36.481332383130734],[56.57304452991976,36.47681906587067]],
        "photo": "https://cdn.discordapp.com/attachments/1440751646526275725/1505657486626258974/2.png?ex=6a0b6c4e&is=6a0a1ace&hm=d150fc82667665049542710adb668b07c868fa38d10bd80b8d67b4db6b591c1d&",
        "lanes": [
            {"id": 1, "name": "Полоса 1", "direction": "На Санкт-Петербург",          "condition": "Хорошее",            "last_paved": "2023-06-10"},
            {"id": 2, "name": "Полоса 2", "direction": "На Санкт-Петербург",          "condition": "Критическое",        "last_paved": "2017-11-30"},
            {"id": 3, "name": "Полоса 3", "direction": "На Москву", "condition": "Удовлетворительное", "last_paved": "2022-04-05"},
            {"id": 4, "name": "Полоса 4", "direction": "На Москву", "condition": "Плохое",             "last_paved": "2020-02-14"},
        ],
        "weather_suitable": False,
        "weather_note": "Ожидаются осадки (дождь) — ремонт не рекомендуется",
        "weather_windows": [],
        "repair_hours": 120,
    },
    {
        "id": 3,
        "name": "361-й километр",
        "coords": [57.930603, 33.928645],
        "polygon": [[57.92912981426721,33.93263208209205],[57.92897713856604,33.932438963043],[57.9301774330567,33.92951570679201],[57.93204937767758,33.92466205493255],[57.93220061351367,33.92492491141599],[57.93033057170833,33.92978427662804]],
        "photo": "https://cdn.discordapp.com/attachments/1440751646526275725/1505657484080320512/3.png?ex=6a0b6c4d&is=6a0a1acd&hm=116bd2091c6af1a79cf78d44278fab46f7d10166c52f9e3745b294d19d995edf&",
        "lanes": [
            {"id": 1, "name": "Полоса 1", "direction": "На Санкт-Петербург",          "condition": "Критическое",        "last_paved": "2015-05-22"},
            {"id": 2, "name": "Полоса 2", "direction": "На Санкт-Петербург",          "condition": "Плохое",             "last_paved": "2018-09-14"},
            {"id": 3, "name": "Полоса 3", "direction": "На Москву", "condition": "Удовлетворительное", "last_paved": "2021-06-30"},
            {"id": 4, "name": "Полоса 4", "direction": "На Москву", "condition": "Хорошее",            "last_paved": "2023-03-15"},
        ],
        "weather_suitable": True,
        "weather_note": "Температура +22°C, ясно — ремонт возможен",
        "weather_windows": ["09:00–17:00"],
        "repair_hours": 96,
    },
    {
        "id": 4,
        "name": "302-й километр",
        "coords": [57.472149, 34.349623],
        "polygon": [[57.474622918002076,34.342582025192115],[57.47346910890025,34.345686834589216],[57.472276254491454,34.349095394538224],[57.47134149909031,34.35200079980757],[57.46974030224565,34.35671075883772],[57.46952641863442,34.356592741641066],[57.47111779116366,34.35174527031947],[57.47204454674023,34.348880671091564],[57.473281713956,34.345493010004695],[57.47444485824888,34.342344703799995]],
        "photo": "https://cdn.discordapp.com/attachments/1440751646526275725/1505657484487037050/4.png?ex=6a0b6c4e&is=6a0a1ace&hm=ed6c607b2d15b126a37315e48483d469f52dd83326eb7542fb5c41e6bffb14b7&",
        "lanes": [
            {"id": 1, "name": "Полоса 1", "direction": "На Санкт-Петербург",          "condition": "Плохое",             "last_paved": "2020-07-18"},
            {"id": 2, "name": "Полоса 2", "direction": "На Санкт-Петербург",          "condition": "Удовлетворительное", "last_paved": "2021-12-01"},
            {"id": 3, "name": "Полоса 3", "direction": "На Москву", "condition": "Хорошее",            "last_paved": "2023-05-20"},
            {"id": 4, "name": "Полоса 4", "direction": "На Москву", "condition": "Плохое",             "last_paved": "2020-03-10"},
        ],
        "weather_suitable": True,
        "weather_note": "Температура +15°C, без осадков — ремонт возможен",
        "weather_windows": ["07:00–13:00"],
        "repair_hours": 48,
    },
    {
        "id": 5,
        "name": "151-й километр",
        "coords": [56.761401, 36.207698],
        "polygon": [[56.764372260928184,36.20137469224737],[56.76311425462504,36.2040622656803],[56.762171458692414,36.20616511754797],[56.76134060007369,36.208021206186274],[56.75858269115216,36.21424400944549],[56.75842300357991,36.21400025302677],[56.761152640680834,36.20786035836518],[56.76297537590116,36.203805423919235],[56.764236332988254,36.201166130248595]],
        "photo": "https://cdn.discordapp.com/attachments/1440751646526275725/1505657484998869186/5.png?ex=6a0b6c4e&is=6a0a1ace&hm=24c58fb98cf60b66b9c8883e18497ed70592671d7b7f1df4b9f6fa673f0745ba&",
        "lanes": [
            {"id": 1, "name": "Полоса 1", "direction": "На Санкт-Петербург",          "condition": "Удовлетворительное", "last_paved": "2022-11-01"},
            {"id": 2, "name": "Полоса 2", "direction": "На Санкт-Петербург",          "condition": "Плохое",             "last_paved": "2020-11-05"},
            {"id": 3, "name": "Полоса 3", "direction": "На Москву", "condition": "Хорошее",            "last_paved": "2024-03-20"},
            {"id": 4, "name": "Полоса 4", "direction": "На Москву", "condition": "Хорошее",            "last_paved": "2023-09-15"},
        ],
        "weather_suitable": True,
        "weather_note": "Температура +12°C, без осадков — ремонт возможен",
        "weather_windows": ["08:00–11:00", "15:00–18:00"],
        "repair_hours": 60,
    },
]

_VEHICLES_F1 = [
    {
        "id": 11, "type": "dump_truck", "name": "Самосвал КамАЗ-6522 №05",
        "coords": [55.859778, 37.536148],
        "speed_kmh": 0,
        "current_task": "Загрузка асфальтобетоном",
        "location_type": "factory",
        "location_name": "АБЗ-1",
        "schedule": [
            {"date": "2026-05-18", "time": "07:45", "location": "АБЗ-1", "task": "Загрузка асфальтобетоном"},
            {"date": "2026-05-18", "time": "09:00", "location": "102-й км, уч.1", "task": "Выгрузка"},
            {"date": "2026-05-18", "time": "10:00", "location": "АБЗ-1", "task": "Повторная загрузка"},
        ],
    },
    {
        "id": 12, "type": "dump_truck", "name": "Самосвал КамАЗ-65115 №06",
        "coords": [56.152, 36.449],
        "speed_kmh": 74,
        "current_task": "Следует к объекту",
        "location_type": "transit",
        "location_name": None,
        "schedule": [
            {"date": "2026-05-18", "time": "08:00", "location": "АБЗ-1", "task": "Загрузка"},
            {"date": "2026-05-18", "time": "09:15", "location": "102-й км, уч.1", "task": "Выгрузка"},
        ],
    },
]

_VEHICLES_F3 = [
    {
        "id": 13, "type": "dump_truck", "name": "Самосвал МАЗ-6516 №07",
        "coords": [57.129092, 35.434167],
        "speed_kmh": 0,
        "current_task": "Ожидание загрузки",
        "location_type": "factory",
        "location_name": "АБЗ (Лихославльский муниципальный округ)",
        "schedule": [
            {"date": "2026-05-18", "time": "07:30", "location": "АБЗ Лихославль", "task": "Загрузка асфальтобетоном холодным"},
            {"date": "2026-05-18", "time": "09:30", "location": "361-й км, уч.2", "task": "Выгрузка"},
        ],
    },
]

FACTORIES = [
    {
        "id": "abz_1_msk",
        "name": "АБЗ-1",
        "coords": [55.859778, 37.536148],
        "vehicle_count": 2,
        "vehicles": _VEHICLES_F1,
        "mix_temp_c": None,
        "active": True,
        "capacity_t_per_hour": None,
        "materials": ["Асфальтобетон горячий тип А", "Битум БНД 60/90", "Щебень фр. 5-20"],
    },
    {
        "id": "abz_leninsky_tver",
        "name": "АБЗ Ленинский",
        "coords": [56.789664, 35.864321],
        "vehicle_count": 0,
        "vehicles": [],
        "mix_temp_c": None,
        "active": True,
        "capacity_t_per_hour": None,
        "materials": [],
    },
    {
        "id": "abz_likhoslavl",
        "name": "АБЗ (Лихославльский муниципальный округ)",
        "coords": [57.129092, 35.434167],
        "vehicle_count": 1,
        "vehicles": _VEHICLES_F3,
        "mix_temp_c": None,
        "active": True,
        "capacity_t_per_hour": None,
        "materials": ["Асфальтобетон холодный", "Битумная эмульсия катионная"],
    },
]

_VEHICLES_P1 = [
    {
        "id": 1, "type": "dump_truck", "name": "Самосвал КамАЗ-6522 №01",
        "coords": [56.564175, 36.442860],
        "speed_kmh": 0,
        "current_task": "Ожидание смены",
        "location_type": "parking",
        "location_name": "Стоянка №1",
        "schedule": [
            {"date": "2026-05-18", "time": "08:00", "location": "Стоянка №1",         "task": "Погрузка на АБЗ №1"},
            {"date": "2026-05-18", "time": "09:30", "location": "102-й км, уч.1",     "task": "Выгрузка материала"},
            {"date": "2026-05-18", "time": "10:15", "location": "АБЗ №1",             "task": "Обратный рейс — погрузка"},
            {"date": "2026-05-18", "time": "11:45", "location": "102-й км, уч.1",     "task": "Выгрузка материала"},
            {"date": "2026-05-18", "time": "14:00", "location": "Стоянка №1",         "task": "Конец смены"},
        ],
    },
    {
        "id": 2, "type": "dump_truck", "name": "Самосвал КамАЗ-6522 №02",
        "coords": [56.564175, 36.442860],
        "speed_kmh": 0,
        "current_task": "Плановое ТО",
        "location_type": "parking",
        "location_name": "Стоянка №1",
        "schedule": [
            {"date": "2026-05-18", "time": "08:00", "location": "Стоянка №1",         "task": "Погрузка на АБЗ №1"},
            {"date": "2026-05-18", "time": "09:30", "location": "102-й км, уч.1",     "task": "Выгрузка"},
            {"date": "2026-05-18", "time": "10:30", "location": "АБЗ №1",             "task": "Погрузка"},
            {"date": "2026-05-18", "time": "12:00", "location": "102-й км, уч.1",     "task": "Выгрузка"},
            {"date": "2026-05-18", "time": "14:00", "location": "Стоянка №1",         "task": "Конец смены"},
        ],
    },
    {
        "id": 3, "type": "transfer_machine", "name": "Перегружатель Roadtec SB-2500",
        "coords": [56.634, 36.352],
        "speed_kmh": 48,
        "current_task": "Следует к объекту укладки",
        "location_type": "transit",
        "location_name": None,
        "schedule": [
            {"date": "2026-05-18", "time": "09:00", "location": "102-й км, уч.1",     "task": "Подготовка к работе"},
            {"date": "2026-05-18", "time": "09:30", "location": "102-й км, уч.1",     "task": "Перегрузка смеси в укладчик"},
            {"date": "2026-05-18", "time": "13:00", "location": "151-й км, уч.2",     "task": "Переезд"},
            {"date": "2026-05-18", "time": "13:30", "location": "151-й км, уч.2",     "task": "Перегрузка смеси"},
            {"date": "2026-05-18", "time": "16:00", "location": "Стоянка №1",         "task": "Возврат"},
        ],
    },
    {
        "id": 4, "type": "paver", "name": "Асфальтоукладчик Vogele SUPER 1800-3i",
        "coords": [56.390, 36.572],
        "speed_kmh": 2,
        "current_task": "Укладка асфальта — полоса 1",
        "location_type": "transit",
        "location_name": None,
        "schedule": [
            {"date": "2026-05-18", "time": "09:30", "location": "102-й км, уч.1",     "task": "Укладка полосы 1"},
            {"date": "2026-05-18", "time": "11:30", "location": "102-й км, уч.1",     "task": "Укладка полосы 2"},
            {"date": "2026-05-18", "time": "13:00", "location": "151-й км, уч.2",     "task": "Переезд"},
            {"date": "2026-05-18", "time": "13:30", "location": "151-й км, уч.2",     "task": "Укладка"},
            {"date": "2026-05-18", "time": "16:00", "location": "Стоянка №1",         "task": "Возврат"},
        ],
    },
    {
        "id": 5, "type": "roller", "name": "Каток Bomag BW 213 D-5",
        "coords": [56.391, 36.574],
        "speed_kmh": 3,
        "current_task": "Уплотнение покрытия (3 прохода)",
        "location_type": "transit",
        "location_name": None,
        "schedule": [
            {"date": "2026-05-18", "time": "10:00", "location": "102-й км, уч.1",     "task": "Уплотнение полосы 1 (3 прохода)"},
            {"date": "2026-05-18", "time": "12:00", "location": "102-й км, уч.1",     "task": "Уплотнение полосы 2"},
            {"date": "2026-05-18", "time": "13:30", "location": "151-й км, уч.2",     "task": "Переезд"},
            {"date": "2026-05-18", "time": "14:00", "location": "151-й км, уч.2",     "task": "Уплотнение"},
            {"date": "2026-05-18", "time": "16:30", "location": "Стоянка №1",         "task": "Возврат"},
        ],
    },
]

_VEHICLES_P2 = [
    {
        "id": 6, "type": "dump_truck", "name": "Самосвал КамАЗ-65115 №03",
        "coords": [57.240149, 34.899585],
        "speed_kmh": 0,
        "current_task": "Плановое ТО",
        "location_type": "parking",
        "location_name": "Стоянка №2",
        "schedule": [
            {"date": "2026-05-18", "time": "08:30", "location": "Стоянка №2",         "task": "Погрузка на АБЗ №2"},
            {"date": "2026-05-18", "time": "10:00", "location": "302-й км, уч.5",     "task": "Выгрузка"},
            {"date": "2026-05-18", "time": "11:00", "location": "АБЗ №2",             "task": "Погрузка"},
            {"date": "2026-05-18", "time": "12:30", "location": "302-й км, уч.3",     "task": "Выгрузка"},
            {"date": "2026-05-18", "time": "15:00", "location": "Стоянка №2",         "task": "Конец смены"},
        ],
    },
    {
        "id": 7, "type": "dump_truck", "name": "Самосвал КамАЗ-65115 №04",
        "coords": [57.355, 34.625],
        "speed_kmh": 65,
        "current_task": "Следует к объекту",
        "location_type": "transit",
        "location_name": None,
        "schedule": [
            {"date": "2026-05-18", "time": "08:30", "location": "Стоянка №2",         "task": "Погрузка на АБЗ №2"},
            {"date": "2026-05-18", "time": "10:00", "location": "302-й км, уч.5",     "task": "Выгрузка"},
            {"date": "2026-05-18", "time": "11:30", "location": "АБЗ №2",             "task": "Погрузка"},
            {"date": "2026-05-18", "time": "13:00", "location": "302-й км, уч.5",     "task": "Выгрузка"},
            {"date": "2026-05-18", "time": "16:00", "location": "Стоянка №2",         "task": "Конец смены"},
        ],
    },
    {
        "id": 8, "type": "transfer_machine", "name": "Перегружатель Vogele MT 3000-2i",
        "coords": [57.240149, 34.899585],
        "speed_kmh": 0,
        "current_task": "Ожидание наряда",
        "location_type": "parking",
        "location_name": "Стоянка №2",
        "schedule": [
            {"date": "2026-05-18", "time": "09:30", "location": "302-й км, уч.5",     "task": "Перегрузка смеси"},
            {"date": "2026-05-18", "time": "14:00", "location": "302-й км, уч.3",     "task": "Переезд и перегрузка"},
            {"date": "2026-05-18", "time": "16:30", "location": "Стоянка №2",         "task": "Возврат"},
        ],
    },
    {
        "id": 9, "type": "paver", "name": "Асфальтоукладчик Bomag BF 600 C-2",
        "coords": [57.471, 34.349],
        "speed_kmh": 2,
        "current_task": "Укладка покрытия — полоса 2",
        "location_type": "transit",
        "location_name": None,
        "schedule": [
            {"date": "2026-05-18", "time": "09:30", "location": "302-й км, уч.5",     "task": "Укладка полосы 1"},
            {"date": "2026-05-18", "time": "12:00", "location": "302-й км, уч.5",     "task": "Укладка полосы 3"},
            {"date": "2026-05-18", "time": "14:00", "location": "302-й км, уч.3",     "task": "Укладка"},
            {"date": "2026-05-18", "time": "16:30", "location": "Стоянка №2",         "task": "Возврат"},
        ],
    },
    {
        "id": 10, "type": "roller", "name": "Каток Hamm HD 14 VV",
        "coords": [57.240149, 34.899585],
        "speed_kmh": 0,
        "current_task": "Обслуживание",
        "location_type": "parking",
        "location_name": "Стоянка №2",
        "schedule": [
            {"date": "2026-05-18", "time": "10:00", "location": "302-й км, уч.5",     "task": "Уплотнение"},
            {"date": "2026-05-18", "time": "13:00", "location": "302-й км, уч.5",     "task": "Контрольные проходы"},
            {"date": "2026-05-18", "time": "14:30", "location": "302-й км, уч.3",     "task": "Уплотнение"},
            {"date": "2026-05-18", "time": "17:00", "location": "Стоянка №2",         "task": "Возврат"},
        ],
    },
]

PARKINGS = [
    {"id": 1, "name": "Стоянка №1",  "coords": [56.564175, 36.442860], "vehicles": _VEHICLES_P1},
    {"id": 2, "name": "Стоянка №2", "coords": [57.240149, 34.899585], "vehicles": _VEHICLES_P2},
]

_ALL_VEHICLES = _VEHICLES_P1 + _VEHICLES_P2 + _VEHICLES_F1 + _VEHICLES_F3

TASKS = [
    {
        "id": 1,
        "road_id": 1,
        "road_name": "102-й километр",
        "lane_id": 2,
        "lane_name": "Полоса 2",
        "direction": "На Санкт-Петербург",
        "condition": "Плохое",
        "window": "08:00–12:00",
        "date": "2026-05-18",
        "start_time": "08:00",
        "end_time": "12:00",
        "status": "in_progress",
        "vehicle_ids_roles": [
            {"vehicle_id": 4,  "role": "Укладка асфальта"},
            {"vehicle_id": 5,  "role": "Уплотнение покрытия"},
            {"vehicle_id": 3,  "role": "Перегрузка смеси"},
            {"vehicle_id": 1,  "role": "Подвоз материала"},
            {"vehicle_id": 2,  "role": "Подвоз материала"},
        ],
    },
    {
        "id": 2,
        "road_id": 4,
        "road_name": "302-й километр",
        "lane_id": 1,
        "lane_name": "Полоса 1",
        "direction": "На Санкт-Петербург",
        "condition": "Плохое",
        "window": "07:00–13:00",
        "date": "2026-05-18",
        "start_time": "11:30",
        "end_time": "13:00",
        "status": "planned",
        "vehicle_ids_roles": [
            {"vehicle_id": 9,  "role": "Укладка асфальта"},
            {"vehicle_id": 7,  "role": "Подвоз материала"},
        ],
    },
    {
        "id": 3,
        "road_id": 5,
        "road_name": "151-й километр",
        "lane_id": 1,
        "lane_name": "Полоса 1",
        "direction": "На Санкт-Петербург",
        "condition": "Удовлетворительное",
        "window": "15:00–18:00",
        "date": "2026-05-18",
        "start_time": "15:00",
        "end_time": "18:00",
        "status": "planned",
        "vehicle_ids_roles": [
            {"vehicle_id": 8,  "role": "Перегрузка смеси"},
            {"vehicle_id": 6,  "role": "Подвоз материала"},
            {"vehicle_id": 10, "role": "Уплотнение покрытия"},
        ],
    },
]


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _lerp(p1, p2, t):
    return [p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t]


def _compute_lane_polygons(polygon, lanes):
    if not lanes or not polygon:
        return []
    n = len(polygon)
    half = (n + 1) // 2
    left_start  = polygon[0]
    left_end    = polygon[half - 1]
    right_end   = polygon[half]
    right_start = polygon[-1]
    n_lanes = len(lanes)
    result = []
    for i, lane in enumerate(lanes):
        t1, t2 = i / n_lanes, (i + 1) / n_lanes
        result.append({
            "lane_id": lane["id"],
            "polygon": [
                _lerp(left_start, right_start, t1),
                _lerp(left_start, right_start, t2),
                _lerp(left_end,   right_end,   t2),
                _lerp(left_end,   right_end,   t1),
            ],
        })
    return result


def _vehicle_summary(v):
    return {
        "id":            v["id"],
        "type":          v["type"],
        "name":          v["name"],
        "coords":        v.get("coords"),
        "speed_kmh":     v.get("speed_kmh", 0),
        "current_task":  v.get("current_task"),
        "location_type": v.get("location_type"),
        "location_name": v.get("location_name"),
    }


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/api/roads")
def get_roads():
    return [
        {
            "id": r["id"],
            "name": r["name"],
            "coords": r["coords"],
            "polygon": r["polygon"],
            "lanes": r["lanes"],
            "weather_windows": r.get("weather_windows", []),
            "lane_polygons": _compute_lane_polygons(r["polygon"], r["lanes"]),
        }
        for r in ROADS
    ]


@app.get("/api/roads/{road_id}")
def get_road(road_id: int):
    road = next((r for r in ROADS if r["id"] == road_id), None)
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")
    return {**road, "lane_polygons": _compute_lane_polygons(road["polygon"], road["lanes"])}


@app.get("/api/factories")
def get_factories():
    return [
        {k: v for k, v in f.items() if k != "vehicles"}
        for f in FACTORIES
    ]


@app.get("/api/factories/{factory_id}")
def get_factory(factory_id: str):
    factory = next((f for f in FACTORIES if f["id"] == factory_id), None)
    if not factory:
        raise HTTPException(status_code=404, detail="Factory not found")
    return factory


@app.get("/api/parkings")
def get_parkings():
    return [
        {
            "id": p["id"],
            "name": p["name"],
            "coords": p["coords"],
            "vehicle_count": len(p["vehicles"]),
        }
        for p in PARKINGS
    ]


@app.get("/api/parkings/{parking_id}")
def get_parking(parking_id: int):
    parking = next((p for p in PARKINGS if p["id"] == parking_id), None)
    if not parking:
        raise HTTPException(status_code=404, detail="Parking not found")
    return {
        **parking,
        "vehicles": [_vehicle_summary(v) for v in parking["vehicles"]],
    }


@app.get("/api/lanes")
def get_all_lanes():
    result = []
    for road in ROADS:
        for lane in road["lanes"]:
            result.append({
                "id": lane["id"],
                "road_id": road["id"],
                "road_name": road["name"],
                "repair_hours": road["repair_hours"],
                "name": lane["name"],
                "direction": lane.get("direction", ""),
                "condition": lane["condition"],
                "last_paved": lane["last_paved"],
                "weather_suitable": road["weather_suitable"],
                "weather_note": road["weather_note"],
                "weather_windows": road.get("weather_windows", []),
            })
    return result


@app.get("/api/vehicles")
def get_all_vehicles(type: str = None):
    result = _ALL_VEHICLES if not type else [v for v in _ALL_VEHICLES if v["type"] == type]
    return [_vehicle_summary(v) for v in result]


@app.get("/api/vehicles/{vehicle_id}")
def get_vehicle(vehicle_id: int):
    v = next((v for v in _ALL_VEHICLES if v["id"] == vehicle_id), None)
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return v


class PlanRequest(BaseModel):
    road_id: int
    lane_id: int


@app.post("/api/plans")
def create_plan(req: PlanRequest):
    road = next((r for r in ROADS if r["id"] == req.road_id), None)
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")
    dump_truck_count = max(2, round(road["repair_hours"] / 36))

    def suggest(type_key, count):
        return [
            _vehicle_summary(v)
            for v in _ALL_VEHICLES if v["type"] == type_key
        ][:count]

    plan = {
        "road_name": road["name"],
        "dump_trucks": dump_truck_count,
        "transfer_machines": 1,
        "pavers": 1,
        "rollers": 2,
        "closure_vehicles": 1,
        "suggested_vehicles": {
            "dump_truck":       suggest("dump_truck", dump_truck_count),
            "transfer_machine": suggest("transfer_machine", 1),
            "paver":            suggest("paver", 1),
            "roller":           suggest("roller", 2),
            "closure_vehicle":  suggest("closure_vehicle", 1),
        },
    }
    return plan


@app.get("/api/tasks")
def get_tasks():
    return [
        {
            "id":            t["id"],
            "road_name":     t["road_name"],
            "lane_name":     t["lane_name"],
            "direction":     t["direction"],
            "condition":     t["condition"],
            "window":        t["window"],
            "date":          t["date"],
            "start_time":    t["start_time"],
            "end_time":      t["end_time"],
            "status":        t["status"],
            "vehicle_count": len(t["vehicle_ids_roles"]),
        }
        for t in TASKS
    ]


@app.get("/api/tasks/{task_id}")
def get_task(task_id: int):
    task = next((t for t in TASKS if t["id"] == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    vehicles = []
    for vr in task["vehicle_ids_roles"]:
        v = next((v for v in _ALL_VEHICLES if v["id"] == vr["vehicle_id"]), None)
        if v:
            vehicles.append({**_vehicle_summary(v), "role": vr["role"]})
    return {
        "id":         task["id"],
        "road_name":  task["road_name"],
        "lane_name":  task["lane_name"],
        "direction":  task["direction"],
        "condition":  task["condition"],
        "window":     task["window"],
        "date":       task["date"],
        "start_time": task["start_time"],
        "end_time":   task["end_time"],
        "status":     task["status"],
        "vehicles":   vehicles,
    }


class RepairPlanRequest(BaseModel):
    road_id: int
    lane_id: int
    window:  str


@app.post("/api/repair/plan")
def create_repair_plan(req: RepairPlanRequest):
    road = next((r for r in ROADS if r["id"] == req.road_id), None)
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")
    lane = next((l for l in road["lanes"] if l["id"] == req.lane_id), None)
    if not lane:
        raise HTTPException(status_code=404, detail="Lane not found")
    result = plan_repair(
        road=road,
        lane=lane,
        window_str=req.window,
        all_vehicles=_ALL_VEHICLES,
        factories=FACTORIES,
        parkings=PARKINGS,
    )
    return result


@app.post("/api/auth/register")
def register(body: dict):
    return {"ok": True, "message": "Регистрация успешна"}


@app.post("/api/auth/login")
def login(body: dict):
    return {"ok": True, "message": "Вход выполнен"}
