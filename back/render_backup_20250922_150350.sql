--
-- PostgreSQL database dump
--

\restrict 9VGRgOG6fTYedGp89gdIP119T5kb3wiztwWnspZtS679Gw4IyGQwysiBgiD7FuZ

-- Dumped from database version 16.10 (Debian 16.10-1.pgdg12+1)
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: gosotral_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO gosotral_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: gosotral_user
--

CREATE TABLE public.bookings (
    id character varying(50) NOT NULL,
    user_id integer,
    trip_id character varying(50),
    seat_numbers text NOT NULL,
    total_price numeric(10,2) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    payment_status character varying(20) DEFAULT 'pending'::character varying,
    payment_method character varying(20),
    booking_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    passenger_name character varying(100) NOT NULL,
    passenger_phone character varying(20) NOT NULL,
    passenger_email character varying(100),
    qr_code text,
    cancelled_at timestamp without time zone,
    cancel_reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.bookings OWNER TO gosotral_user;

--
-- Name: bus_lines; Type: TABLE; Schema: public; Owner: gosotral_user
--

CREATE TABLE public.bus_lines (
    id character varying(50) NOT NULL,
    line_name character varying(100) NOT NULL,
    line_code character varying(20),
    from_city character varying(100) NOT NULL,
    to_city character varying(100) NOT NULL,
    base_price numeric(10,2) DEFAULT 0 NOT NULL,
    estimated_duration integer NOT NULL,
    is_active boolean DEFAULT true,
    bus_stops text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.bus_lines OWNER TO gosotral_user;

--
-- Name: email_otps; Type: TABLE; Schema: public; Owner: gosotral_user
--

CREATE TABLE public.email_otps (
    id integer NOT NULL,
    user_id integer,
    otp character varying(10) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.email_otps OWNER TO gosotral_user;

--
-- Name: email_otps_id_seq; Type: SEQUENCE; Schema: public; Owner: gosotral_user
--

CREATE SEQUENCE public.email_otps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_otps_id_seq OWNER TO gosotral_user;

--
-- Name: email_otps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gosotral_user
--

ALTER SEQUENCE public.email_otps_id_seq OWNED BY public.email_otps.id;


--
-- Name: mobile_payments; Type: TABLE; Schema: public; Owner: gosotral_user
--

CREATE TABLE public.mobile_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_id character varying(60),
    amount integer NOT NULL,
    currency text DEFAULT 'XOF'::text NOT NULL,
    provider text NOT NULL,
    phone_number text NOT NULL,
    transaction_id text,
    external_reference text,
    status text DEFAULT 'pending'::text NOT NULL,
    initiated_at timestamp without time zone DEFAULT now(),
    completed_at timestamp without time zone,
    failure_reason text,
    webhook_data jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT mobile_payments_provider_check CHECK ((provider = ANY (ARRAY['yass'::text, 'flooz'::text]))),
    CONSTRAINT mobile_payments_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text, 'cancelled'::text])))
);


ALTER TABLE public.mobile_payments OWNER TO gosotral_user;

--
-- Name: password_reset_otps; Type: TABLE; Schema: public; Owner: gosotral_user
--

CREATE TABLE public.password_reset_otps (
    id integer NOT NULL,
    user_id integer,
    otp character varying(10) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.password_reset_otps OWNER TO gosotral_user;

--
-- Name: password_reset_otps_id_seq; Type: SEQUENCE; Schema: public; Owner: gosotral_user
--

CREATE SEQUENCE public.password_reset_otps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_otps_id_seq OWNER TO gosotral_user;

--
-- Name: password_reset_otps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gosotral_user
--

ALTER SEQUENCE public.password_reset_otps_id_seq OWNED BY public.password_reset_otps.id;


--
-- Name: payment_configs; Type: TABLE; Schema: public; Owner: gosotral_user
--

CREATE TABLE public.payment_configs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider text NOT NULL,
    api_key text NOT NULL,
    api_secret text NOT NULL,
    webhook_url text NOT NULL,
    is_sandbox boolean DEFAULT true NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT payment_configs_provider_check CHECK ((provider = ANY (ARRAY['yass'::text, 'flooz'::text])))
);


ALTER TABLE public.payment_configs OWNER TO gosotral_user;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: gosotral_user
--

CREATE TABLE public.payments (
    id character varying(50) NOT NULL,
    booking_id character varying(50),
    amount numeric(10,2) NOT NULL,
    payment_method character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    transaction_id character varying(100),
    payment_date timestamp without time zone,
    mobile_money_phone character varying(20),
    mobile_money_operator character varying(10),
    mobile_money_reference character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.payments OWNER TO gosotral_user;

--
-- Name: routes; Type: TABLE; Schema: public; Owner: gosotral_user
--

CREATE TABLE public.routes (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(50) NOT NULL,
    start_point character varying(100) NOT NULL,
    end_point character varying(100) NOT NULL,
    distance_km double precision,
    duration_minutes integer,
    price_category character varying(10) NOT NULL,
    is_active boolean DEFAULT true,
    stops jsonb,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.routes OWNER TO gosotral_user;

--
-- Name: ticket_products; Type: TABLE; Schema: public; Owner: gosotral_user
--

CREATE TABLE public.ticket_products (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(50) NOT NULL,
    price integer NOT NULL,
    rides integer DEFAULT 1 NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ticket_products OWNER TO gosotral_user;

--
-- Name: ticket_validations; Type: TABLE; Schema: public; Owner: gosotral_user
--

CREATE TABLE public.ticket_validations (
    id character varying(60) NOT NULL,
    ticket_id character varying(60),
    validator_id integer,
    validation_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    bus_line_id character varying(50),
    location_lat double precision,
    location_lng double precision,
    device_id character varying(100),
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ticket_validations OWNER TO gosotral_user;

--
-- Name: tickets; Type: TABLE; Schema: public; Owner: gosotral_user
--

CREATE TABLE public.tickets (
    id character varying(60) NOT NULL,
    user_id integer,
    product_code character varying(50) NOT NULL,
    code character varying(100) NOT NULL,
    status character varying(20) DEFAULT 'unused'::character varying,
    purchased_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    used_at timestamp without time zone,
    purchase_method character varying(20),
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tickets OWNER TO gosotral_user;

--
-- Name: trips; Type: TABLE; Schema: public; Owner: gosotral_user
--

CREATE TABLE public.trips (
    id character varying(50) NOT NULL,
    bus_line_id character varying(50),
    departure_time timestamp without time zone NOT NULL,
    arrival_time timestamp without time zone NOT NULL,
    price numeric(10,2) NOT NULL,
    available_seats integer DEFAULT 30 NOT NULL,
    total_seats integer DEFAULT 30 NOT NULL,
    status character varying(20) DEFAULT 'scheduled'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.trips OWNER TO gosotral_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: gosotral_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    is_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO gosotral_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: gosotral_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO gosotral_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gosotral_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: email_otps id; Type: DEFAULT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.email_otps ALTER COLUMN id SET DEFAULT nextval('public.email_otps_id_seq'::regclass);


--
-- Name: password_reset_otps id; Type: DEFAULT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.password_reset_otps ALTER COLUMN id SET DEFAULT nextval('public.password_reset_otps_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: gosotral_user
--

COPY public.bookings (id, user_id, trip_id, seat_numbers, total_price, status, payment_status, payment_method, booking_date, passenger_name, passenger_phone, passenger_email, qr_code, cancelled_at, cancel_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: bus_lines; Type: TABLE DATA; Schema: public; Owner: gosotral_user
--

COPY public.bus_lines (id, line_name, line_code, from_city, to_city, base_price, estimated_duration, is_active, bus_stops, created_at, updated_at) FROM stdin;
BL001	Lomé - Kpalimé	LK01	Lomé	Kpalimé	2500.00	120	t	["Grand Marché", "Gare Routière", "Tsévié", "Kpalimé Centre"]	2025-09-11 12:02:10.530919	2025-09-11 12:02:10.530919
BL002	Lomé - Sokodé	LS01	Lomé	Sokodé	4500.00	240	t	["Grand Marché", "Gare Routière", "Atakpamé", "Sokodé Centre"]	2025-09-11 12:02:10.530919	2025-09-11 12:02:10.530919
BL003	Lomé - Kara	LKA01	Lomé	Kara	6000.00	360	t	["Grand Marché", "Gare Routière", "Atakpamé", "Sokodé", "Kara Centre"]	2025-09-11 12:02:10.530919	2025-09-11 12:02:10.530919
\.


--
-- Data for Name: email_otps; Type: TABLE DATA; Schema: public; Owner: gosotral_user
--

COPY public.email_otps (id, user_id, otp, expires_at, created_at) FROM stdin;
1	1	350768	2025-09-11 12:19:27.991	2025-09-11 12:04:27.99229
3	3	994538	2025-09-11 12:35:04.474	2025-09-11 12:20:04.474538
4	4	664020	2025-09-11 12:40:49.185	2025-09-11 12:25:49.187935
5	5	097984	2025-09-11 12:47:54.273	2025-09-11 12:32:54.272262
6	6	500375	2025-09-11 13:00:50.777	2025-09-11 12:45:50.782052
7	7	292130	2025-09-11 13:05:22.779	2025-09-11 12:50:22.778064
8	8	956482	2025-09-11 16:26:33.4	2025-09-11 16:11:33.402471
11	11	799140	2025-09-16 09:11:46.779	2025-09-16 08:56:46.779384
13	12	685624	2025-09-16 11:26:03.351	2025-09-16 11:11:03.352775
15	15	874495	2025-09-16 11:49:56.657	2025-09-16 11:34:56.656156
16	15	966174	2025-09-16 11:50:20.891	2025-09-16 11:35:20.890809
\.


--
-- Data for Name: mobile_payments; Type: TABLE DATA; Schema: public; Owner: gosotral_user
--

COPY public.mobile_payments (id, ticket_id, amount, currency, provider, phone_number, transaction_id, external_reference, status, initiated_at, completed_at, failure_reason, webhook_data, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: password_reset_otps; Type: TABLE DATA; Schema: public; Owner: gosotral_user
--

COPY public.password_reset_otps (id, user_id, otp, expires_at, created_at) FROM stdin;
1	7	915802	2025-09-11 14:31:57.3	2025-09-11 14:16:57.305265
2	7	809430	2025-09-11 15:51:25.189	2025-09-11 15:36:25.191111
3	7	803722	2025-09-11 15:55:37.427	2025-09-11 15:40:37.428988
4	7	432862	2025-09-11 16:11:20.207	2025-09-11 15:56:20.210537
5	7	157251	2025-09-11 16:13:40.642	2025-09-11 15:58:40.644698
6	7	087430	2025-09-11 16:14:08.212	2025-09-11 15:59:08.215201
7	7	286658	2025-09-11 16:16:02.648	2025-09-11 16:01:02.650375
8	7	273681	2025-09-11 16:19:18.922	2025-09-11 16:04:18.925115
9	7	604335	2025-09-11 16:19:45.273	2025-09-11 16:04:45.276184
10	8	832814	2025-09-11 16:28:00.39	2025-09-11 16:13:00.392307
11	8	537905	2025-09-11 17:39:35.169	2025-09-11 17:24:35.172138
12	8	973181	2025-09-11 17:40:35.945	2025-09-11 17:25:35.948177
13	8	598399	2025-09-11 17:41:59.479	2025-09-11 17:26:59.481062
14	8	244943	2025-09-11 17:45:17.625	2025-09-11 17:30:17.629653
15	8	866222	2025-09-11 17:45:27.534	2025-09-11 17:30:27.535781
17	9	355278	2025-09-11 18:21:05.14	2025-09-11 18:06:05.142814
19	11	370203	2025-09-16 09:36:01.402	2025-09-16 09:21:01.487415
21	11	722722	2025-09-16 09:38:21.811	2025-09-16 09:23:21.81105
22	11	471768	2025-09-16 09:38:25.9	2025-09-16 09:23:25.96434
23	11	789648	2025-09-16 09:38:50.595	2025-09-16 09:23:50.594749
\.


--
-- Data for Name: payment_configs; Type: TABLE DATA; Schema: public; Owner: gosotral_user
--

COPY public.payment_configs (id, provider, api_key, api_secret, webhook_url, is_sandbox, active, created_at, updated_at) FROM stdin;
997dc7d4-f3ef-499b-bdc5-993700ed36ae	yass	YASS_SANDBOX_KEY	YASS_SANDBOX_SECRET	https://api.gosotral.com/api/transport/payments/webhook	t	t	2025-09-11 12:00:13.758679	2025-09-11 12:00:13.758679
27dde0bc-c26d-4818-bcf3-21f476739ea8	flooz	FLOOZ_SANDBOX_KEY	FLOOZ_SANDBOX_SECRET	https://api.gosotral.com/api/transport/payments/webhook	t	t	2025-09-11 12:00:13.758679	2025-09-11 12:00:13.758679
5988cb08-172d-4d89-8acd-4ce9a9909f58	yass	YASS_SANDBOX_KEY	YASS_SANDBOX_SECRET	https://api.gosotral.com/api/transport/payments/webhook	t	t	2025-09-11 12:02:32.821062	2025-09-11 12:02:32.821062
b81f6402-9ee3-4eee-8105-23b247da4463	flooz	FLOOZ_SANDBOX_KEY	FLOOZ_SANDBOX_SECRET	https://api.gosotral.com/api/transport/payments/webhook	t	t	2025-09-11 12:02:32.821062	2025-09-11 12:02:32.821062
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: gosotral_user
--

COPY public.payments (id, booking_id, amount, payment_method, status, transaction_id, payment_date, mobile_money_phone, mobile_money_operator, mobile_money_reference, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: routes; Type: TABLE DATA; Schema: public; Owner: gosotral_user
--

COPY public.routes (id, name, code, start_point, end_point, distance_km, duration_minutes, price_category, is_active, stops, metadata, created_at, updated_at) FROM stdin;
R1	Adidogomé - Bè	ADIDO-BE	Adidogomé	Bè	12.5	45	T100	t	["Adidogomé", "Nukafu", "GTA", "Colombe de la Paix", "Camp GP", "Bè"]	\N	2025-09-11 12:01:47.809007	2025-09-11 12:01:47.809007
R2	Agbalépédo - Port	AGBA-PORT	Agbalépédo	Port	10.8	40	T100	t	["Agbalépédo", "Limousine", "Gbossimé", "Douane", "Port"]	\N	2025-09-11 12:01:47.809007	2025-09-11 12:01:47.809007
R3	Gbonvié - Akodessewa	GBON-AKOD	Gbonvié	Akodessewa	15.2	55	T150	t	["Gbonvié", "Sagboville", "Adidogomé", "Souroukou", "Akodessewa"]	\N	2025-09-11 12:01:47.809007	2025-09-11 12:01:47.809007
R4	Agoè - Université	AGOE-UNIV	Agoè	Université de Lomé	8.7	30	T150	t	["Agoè", "Koshigan", "Adidogomé", "Campus", "Université"]	\N	2025-09-11 12:01:47.809007	2025-09-11 12:01:47.809007
R5	Avedji - Marché d'Adawlato	AVED-ADAW	Avedji	Marché d'Adawlato	11.3	45	T200	t	["Avedji", "Avénou", "Octaviano", "Dékon", "Adawlato"]	\N	2025-09-11 12:01:47.809007	2025-09-11 12:01:47.809007
R6	Aéroport - Agoe Assiyéyé	AERO-AGOE	Aéroport International de Lomé	Agoe Assiyéyé	18.5	65	T250	t	["Aéroport", "Bè", "Akodessewa", "Kégué", "Agoè Assiyéyé"]	\N	2025-09-11 12:01:47.809007	2025-09-11 12:01:47.809007
R7	Baguida - Centre-ville	BAGU-CENT	Baguida	Centre-ville	22.4	75	T300	t	["Baguida", "Zone Portuaire", "Bè", "Gbényedji", "Centre-ville"]	\N	2025-09-11 12:01:47.809007	2025-09-11 12:01:47.809007
R8	Zanguéra - Bè	ZANG-BE	Zanguéra	Bè	20.1	70	T300	t	["Zanguéra", "Zongo", "Doulassamé", "Nyékonakpoè", "Bè"]	\N	2025-09-11 12:01:47.809007	2025-09-11 12:01:47.809007
\.


--
-- Data for Name: ticket_products; Type: TABLE DATA; Schema: public; Owner: gosotral_user
--

COPY public.ticket_products (id, name, code, price, rides, is_active, created_at, updated_at) FROM stdin;
T100	Ticket unitaire 100 F	T100	100	1	t	2025-09-11 12:01:25.696333	2025-09-11 12:01:25.696333
T150	Ticket étudiant 150 F	T150	150	1	t	2025-09-11 12:01:25.696333	2025-09-11 12:01:25.696333
T200	Ticket unitaire 200 F	T200	200	1	t	2025-09-11 12:01:25.696333	2025-09-11 12:01:25.696333
T250	Ticket unitaire 250 F	T250	250	1	t	2025-09-11 12:01:25.696333	2025-09-11 12:01:25.696333
T300	Ticket unitaire 300 F	T300	300	1	t	2025-09-11 12:01:25.696333	2025-09-11 12:01:25.696333
CARNET10_100	Carnet 10 × 100 F	CARNET10_100	1000	10	t	2025-09-11 12:01:25.696333	2025-09-11 12:01:25.696333
CARNET10_150	Carnet 10 × 150 F (étudiant)	CARNET10_150	1500	10	t	2025-09-11 12:01:25.696333	2025-09-11 12:01:25.696333
CARNET10_200	Carnet 10 × 200 F	CARNET10_200	2000	10	t	2025-09-11 12:01:25.696333	2025-09-11 12:01:25.696333
CARNET10_250	Carnet 10 × 250 F	CARNET10_250	2500	10	t	2025-09-11 12:01:25.696333	2025-09-11 12:01:25.696333
CARNET10_300	Carnet 10 × 300 F	CARNET10_300	3000	10	t	2025-09-11 12:01:25.696333	2025-09-11 12:01:25.696333
\.


--
-- Data for Name: ticket_validations; Type: TABLE DATA; Schema: public; Owner: gosotral_user
--

COPY public.ticket_validations (id, ticket_id, validator_id, validation_time, bus_line_id, location_lat, location_lng, device_id, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: gosotral_user
--

COPY public.tickets (id, user_id, product_code, code, status, purchased_at, used_at, purchase_method, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: gosotral_user
--

COPY public.trips (id, bus_line_id, departure_time, arrival_time, price, available_seats, total_seats, status, created_at, updated_at) FROM stdin;
T001	BL001	2025-09-02 08:00:00	2025-09-02 10:00:00	2500.00	28	30	scheduled	2025-09-11 12:02:10.802194	2025-09-11 12:02:10.802194
T002	BL001	2025-09-02 14:00:00	2025-09-02 16:00:00	2500.00	30	30	scheduled	2025-09-11 12:02:10.802194	2025-09-11 12:02:10.802194
T003	BL002	2025-09-02 09:00:00	2025-09-02 13:00:00	4500.00	25	30	scheduled	2025-09-11 12:02:10.802194	2025-09-11 12:02:10.802194
T004	BL003	2025-09-02 07:00:00	2025-09-02 13:00:00	6000.00	30	30	scheduled	2025-09-11 12:02:10.802194	2025-09-11 12:02:10.802194
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: gosotral_user
--

COPY public.users (id, email, name, password, phone, is_verified, created_at) FROM stdin;
1	matchamegnatikevin894@gmail.com	Kev	$2a$10$g5si.QlUKd8BHkke8nRGF.dpRPNz4QYQ6PNfj76xkp/wOh4nf/Paq	+22870472436	f	2025-09-11 12:04:27.970611
3	elya.neblett@allfreemail.net	Kev	$2a$10$jbnHtrQsZjNp1Ydjg7mhE.WelYyY01GRku4t8XiJCI6yUtpvtoA..	+22870472436	f	2025-09-11 12:20:04.47136
4	glenndora.calvi@allfreemail.net	Zée	$2a$10$P4AFRCkdQ648LVG2tkyE0.UvwmI94pcsS2U3IhR0da7vDSm7F4lGa	+22870472436	f	2025-09-11 12:25:49.176882
5	alexzander.myers@allfreemail.net	Haf	$2a$10$GHrTJc1rJizlMIIIA93mPOTplRn1mVP998sGoRt4PYUCHlw5o.P12	+22870472436	f	2025-09-11 12:32:54.267006
6	avarielle.reuter@allfreemail.net	Zee	$2a$10$CiorU.QqF2i3UqXC6wt3DukzmE09DMhgocSJHeDP8VG9r5ORICEki	+22870472436	f	2025-09-11 12:45:50.773685
7	opaline.waterman@allfreemail.net	Zee	$2a$10$MZ4umZOisswrmX4OY3h6tugVY1FS.BS4CnJrsvzYKbjar2fs2xazO	+22870472436	f	2025-09-11 12:50:22.775619
8	connye.youngblood@allfreemail.net	Hello	$2a$10$EycJJswcw.7A9qf76WHFDe893twiIqyiH/4MNEHuf.a4sXBbFbhja	+22890099090	f	2025-09-11 16:11:33.400193
9	jannifer.dunklin@allfreemail.net	Ux	$2a$10$p3nInENuzKwz2yza6m5DueKmS1QlkTbJZNBgr4..1MkiJTXt67V3q	+22870472436	t	2025-09-11 17:34:53.796713
10	rixon.blomgren@allfreemail.net	Zeez	$2a$10$83yoFkYSdt6Yj58cBp8cIOq7BLVLeZZm9Ltzg50DwOMTBh/4giuuC	+22870472436	t	2025-09-11 18:10:39.939533
11	ganza.chun@fusioninbox.com	Zek	$2a$10$Pn56hNZOQUtAcEYWjC0iFODaLCCJOAnoV2qsMSCM7Z.liZCqKgLra	+22870472436	t	2025-09-16 08:56:46.775109
12	avid.richeson@fusioninbox.com	lol	$2a$10$Hx.6ErDS5EKzShjZQBpYZ.un3f4xq6QVpXWkjqp4wJt1L3XQoJWtS	+22870442436	f	2025-09-16 11:11:03.349
14	cabella.big@fusioninbox.com	Lee	$2a$10$1eOvgF7JsljndcBiD3IDuOUcWvpb8YVAqvCOoNjSlX2DIz/xAzGAG	+22870472436	t	2025-09-16 11:15:18.55679
15	elbonie.alden@fusioninbox.com	Lill	$2a$10$PDnnhwBTv1XEVoiYVC2Lx.MLwkkP81bfCl1GCsKu0XpWeu1.ww5hC	+22870472436	t	2025-09-16 11:34:56.653271
16	caydince.sullens@allfreemail.net	Kevin	$2a$10$U4fbSMC5okfmcVHtTjygpeAK4pEeywZ6slQpZhZdVX4OsmE0PX.8e	+22870472436	t	2025-09-16 17:17:30.840465
17	nigiel.kucera@allfreemail.net	Kevin	$2a$10$jZO6NDkWujNXoXDnld4/x.0Q3qSKSBL7v4L2MtWx8blf6zxWOSuC6	+22870472436	t	2025-09-16 18:57:20.025608
\.


--
-- Name: email_otps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gosotral_user
--

SELECT pg_catalog.setval('public.email_otps_id_seq', 19, true);


--
-- Name: password_reset_otps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gosotral_user
--

SELECT pg_catalog.setval('public.password_reset_otps_id_seq', 24, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gosotral_user
--

SELECT pg_catalog.setval('public.users_id_seq', 17, true);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: bus_lines bus_lines_line_code_key; Type: CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.bus_lines
    ADD CONSTRAINT bus_lines_line_code_key UNIQUE (line_code);


--
-- Name: bus_lines bus_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.bus_lines
    ADD CONSTRAINT bus_lines_pkey PRIMARY KEY (id);


--
-- Name: email_otps email_otps_pkey; Type: CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.email_otps
    ADD CONSTRAINT email_otps_pkey PRIMARY KEY (id);


--
-- Name: mobile_payments mobile_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.mobile_payments
    ADD CONSTRAINT mobile_payments_pkey PRIMARY KEY (id);


--
-- Name: mobile_payments mobile_payments_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.mobile_payments
    ADD CONSTRAINT mobile_payments_transaction_id_key UNIQUE (transaction_id);


--
-- Name: password_reset_otps password_reset_otps_pkey; Type: CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.password_reset_otps
    ADD CONSTRAINT password_reset_otps_pkey PRIMARY KEY (id);


--
-- Name: payment_configs payment_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.payment_configs
    ADD CONSTRAINT payment_configs_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: routes routes_code_key; Type: CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_code_key UNIQUE (code);


--
-- Name: routes routes_pkey; Type: CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_pkey PRIMARY KEY (id);


--
-- Name: ticket_products ticket_products_code_key; Type: CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.ticket_products
    ADD CONSTRAINT ticket_products_code_key UNIQUE (code);


--
-- Name: ticket_products ticket_products_pkey; Type: CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.ticket_products
    ADD CONSTRAINT ticket_products_pkey PRIMARY KEY (id);


--
-- Name: ticket_validations ticket_validations_pkey; Type: CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.ticket_validations
    ADD CONSTRAINT ticket_validations_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_code_key; Type: CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_code_key UNIQUE (code);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_mobile_payments_phone; Type: INDEX; Schema: public; Owner: gosotral_user
--

CREATE INDEX idx_mobile_payments_phone ON public.mobile_payments USING btree (phone_number);


--
-- Name: idx_mobile_payments_provider; Type: INDEX; Schema: public; Owner: gosotral_user
--

CREATE INDEX idx_mobile_payments_provider ON public.mobile_payments USING btree (provider);


--
-- Name: idx_mobile_payments_status; Type: INDEX; Schema: public; Owner: gosotral_user
--

CREATE INDEX idx_mobile_payments_status ON public.mobile_payments USING btree (status);


--
-- Name: idx_mobile_payments_transaction_id; Type: INDEX; Schema: public; Owner: gosotral_user
--

CREATE INDEX idx_mobile_payments_transaction_id ON public.mobile_payments USING btree (transaction_id);


--
-- Name: idx_tickets_code; Type: INDEX; Schema: public; Owner: gosotral_user
--

CREATE INDEX idx_tickets_code ON public.tickets USING btree (code);


--
-- Name: idx_tickets_status; Type: INDEX; Schema: public; Owner: gosotral_user
--

CREATE INDEX idx_tickets_status ON public.tickets USING btree (status);


--
-- Name: idx_tickets_user; Type: INDEX; Schema: public; Owner: gosotral_user
--

CREATE INDEX idx_tickets_user ON public.tickets USING btree (user_id);


--
-- Name: idx_validations_ticket; Type: INDEX; Schema: public; Owner: gosotral_user
--

CREATE INDEX idx_validations_ticket ON public.ticket_validations USING btree (ticket_id);


--
-- Name: idx_validations_validator; Type: INDEX; Schema: public; Owner: gosotral_user
--

CREATE INDEX idx_validations_validator ON public.ticket_validations USING btree (validator_id);


--
-- Name: bookings bookings_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id);


--
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: email_otps email_otps_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.email_otps
    ADD CONSTRAINT email_otps_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: mobile_payments mobile_payments_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.mobile_payments
    ADD CONSTRAINT mobile_payments_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: password_reset_otps password_reset_otps_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.password_reset_otps
    ADD CONSTRAINT password_reset_otps_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: ticket_validations ticket_validations_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.ticket_validations
    ADD CONSTRAINT ticket_validations_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: ticket_validations ticket_validations_validator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.ticket_validations
    ADD CONSTRAINT ticket_validations_validator_id_fkey FOREIGN KEY (validator_id) REFERENCES public.users(id);


--
-- Name: tickets tickets_product_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_product_code_fkey FOREIGN KEY (product_code) REFERENCES public.ticket_products(code);


--
-- Name: tickets tickets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: trips trips_bus_line_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gosotral_user
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_bus_line_id_fkey FOREIGN KEY (bus_line_id) REFERENCES public.bus_lines(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO gosotral_user;


--
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO gosotral_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO gosotral_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO gosotral_user;


--
-- PostgreSQL database dump complete
--

\unrestrict 9VGRgOG6fTYedGp89gdIP119T5kb3wiztwWnspZtS679Gw4IyGQwysiBgiD7FuZ

