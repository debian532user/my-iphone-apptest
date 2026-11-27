import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  StyleSheet,
  Modal,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';

/* ------------------------------------------------------------------ */
/*  Design tokens                                                      */
/* ------------------------------------------------------------------ */
const C = {
  green: '#1B4D3E',
  emerald: '#2E6F5E',
  deep: '#0F3A2F',
  mist: '#EAF2EF',
  bg: '#F6F8F7',
  card: '#FFFFFF',
  ink: '#14221D',
  muted: '#6B7C75',
  line: '#E3EAE7',
  sky: '#2B5C8A',
  gold: '#C9A24B',
};
const SCREEN_W = Dimensions.get('window').width;

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const DESTINATIONS = [
  { name: 'New York (JFK)', code: 'JFK', dur: 270, prices: [599, 799, 1299] },
  { name: 'London (LHR)', code: 'LHR', dur: 175, prices: [189, 289, 649] },
  { name: 'Paris (CDG)', code: 'CDG', dur: 155, prices: [159, 259, 579] },
  { name: 'Warsaw (WAW)', code: 'WAW', dur: 85, prices: [89, 149, 389] },
  { name: 'Dubai (DXB)', code: 'DXB', dur: 330, prices: [419, 649, 1099] },
  { name: 'Tokyo (HND)', code: 'HND', dur: 705, prices: [849, 1149, 2199] },
];

const CABINS = [
  { id: 'economy', title: 'Economy', desc: 'Comfortable travel\nat a great price.' },
  { id: 'premium', title: 'Premium Economy', desc: 'More space. More comfort.' },
  { id: 'business', title: 'Business', desc: 'Premium experience\nfrom takeoff to landing.' },
];

const FLEET = [
  {
    id: 'b789',
    name: 'Boeing 787-9',
    tagline: 'Modern. Efficient. Comfortable.',
    seats: '299',
    speed: 'Mach 0.85',
    range: 'Long-haul',
    desc:
      'Experience the next level of comfort with our Boeing 787-9 Dreamliner. A more spacious cabin, lower fuel consumption and a smoother flight.',
  },
  {
    id: 'a321',
    name: 'Airbus A321neo',
    tagline: 'Quiet. Quick. Connected.',
    seats: '196',
    speed: 'Mach 0.78',
    range: 'Medium-haul',
    desc:
      'Our workhorse for European routes. Quieter engines, fresh cabin lighting and fast boarding through two aisles.',
  },
  {
    id: 'e195',
    name: 'Embraer E195-E2',
    tagline: 'Small plane. Big comfort.',
    seats: '132',
    speed: 'Mach 0.82',
    range: 'Regional',
    desc:
      'A 2-2 seat layout means no middle seats. Ideal for short hops between regional airports.',
  },
];

const DEALS = [
  { id: 'd1', to: 'Paris (CDG)', note: 'Weekend escape', price: 159, tag: '-20%' },
  { id: 'd2', to: 'London (LHR)', note: 'Business trip fare', price: 189, tag: '-15%' },
  { id: 'd3', to: 'Dubai (DXB)', note: 'Winter sun', price: 419, tag: '-25%' },
  { id: 'd4', to: 'Tokyo (HND)', note: 'Cherry blossom season', price: 849, tag: '-10%' },
];

const BANNERS = [
  { title: 'Fly with\nTimberLines!', sub: 'Your journey. Our wings.', bg: '#2B5C8A' },
  { title: 'Winter deals\nfrom €159', sub: 'Book before the first snow.', bg: '#1F6B57' },
  { title: 'Long-haul,\nlighter feel', sub: 'Meet the Dreamliner.', bg: '#24456B' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const fmtDate = (d) => `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
const pad = (n) => (n < 10 ? '0' + n : '' + n);
const fmtPrice = (n) => {
  const s = String(n);
  return '€' + (s.length > 3 ? s.slice(0, s.length - 3) + ',' + s.slice(-3) : s);
};
const buildDates = () => {
  const now = new Date();
  const out = [];
  for (let i = 1; i <= 45; i++) {
    out.push(new Date(now.getFullYear(), now.getMonth(), now.getDate() + i));
  }
  return out;
};
const findRoute = (to) => {
  const q = (to || '').trim().toLowerCase();
  const hit = DESTINATIONS.find(
    (d) => d.name.toLowerCase() === q || d.code.toLowerCase() === q || d.name.toLowerCase().startsWith(q)
  );
  return hit && q ? hit : null;
};
const timesFor = (dur) => {
  const start = 10 * 60 + 20;
  const end = (start + dur) % (24 * 60);
  return `${pad(Math.floor(start / 60))}:${pad(start % 60)} – ${pad(Math.floor(end / 60))}:${pad(end % 60)}`;
};
const makeRef = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let r = 'TL';
  for (let i = 0; i < 6; i++) r += chars[Math.floor(Math.random() * chars.length)];
  return r;
};

/* ------------------------------------------------------------------ */
/*  Small visual pieces (no images, no icon libraries)                 */
/* ------------------------------------------------------------------ */
const Triangle = ({ w, h, color, style }) => (
  <View
    style={[
      {
        width: 0,
        height: 0,
        borderLeftWidth: w / 2,
        borderRightWidth: w / 2,
        borderBottomWidth: h,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: color,
      },
      style,
    ]}
  />
);

const PineLogo = ({ size = 56, color = '#FFFFFF' }) => (
  <View style={{ alignItems: 'center' }}>
    <Triangle w={size * 0.5} h={size * 0.38} color={color} />
    <Triangle w={size * 0.75} h={size * 0.4} color={color} style={{ marginTop: -size * 0.1 }} />
    <Triangle w={size} h={size * 0.42} color={color} style={{ marginTop: -size * 0.1 }} />
    <View style={{ width: size * 0.12, height: size * 0.12, backgroundColor: color }} />
  </View>
);

const Wordmark = ({ color = C.green, size = 22 }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <PineLogo size={size * 1.3} color={color} />
    <Text style={{ marginLeft: 8, fontSize: size, fontWeight: '800', fontStyle: 'italic', color }}>
      TimberLines
    </Text>
  </View>
);

const Sky = ({ children, style, tone = 'day' }) => {
  const layers =
    tone === 'dusk'
      ? ['#0E3550', '#1E5677', '#6E9DB8']
      : ['#2B5C8A', '#5C93BE', '#BFD9EA'];
  return (
    <View style={[{ overflow: 'hidden', backgroundColor: layers[0] }, style]}>
      <View style={[StyleSheet.absoluteFill, { top: '35%', backgroundColor: layers[1], opacity: 0.8 }]} />
      <View style={[StyleSheet.absoluteFill, { top: '70%', backgroundColor: layers[2], opacity: 0.9 }]} />
      <View style={[styles.cloud, { width: 220, height: 90, right: -50, bottom: 20 }]} />
      <View style={[styles.cloud, { width: 180, height: 70, left: -40, bottom: -10 }]} />
      <View style={[styles.cloud, { width: 120, height: 50, left: 90, bottom: 40, opacity: 0.35 }]} />
      {children}
    </View>
  );
};

const Plane = ({ size = 120, color = '#FFFFFF', rotate = '-20deg' }) => (
  <Text
    style={{
      fontSize: size,
      color,
      transform: [{ rotate }],
      textShadowColor: 'rgba(0,0,0,0.25)',
      textShadowOffset: { width: 0, height: 6 },
      textShadowRadius: 12,
    }}
  >
    ✈︎
  </Text>
);

const PrimaryButton = ({ label, onPress, style, disabled }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    disabled={disabled}
    style={[styles.primaryBtn, disabled && { opacity: 0.5 }, style]}
  >
    <Text style={styles.primaryBtnText}>{label}</Text>
  </TouchableOpacity>
);

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */
export default function App() {
  const [screen, setScreen] = useState('welcome'); // welcome | main | plane | details
  const [tab, setTab] = useState('home'); // home | flights | deals | profile
  const [from, setFrom] = useState('Kyiv (IEV)');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(null); // Date | null
  const [dateOpen, setDateOpen] = useState(false);
  const [cabin, setCabin] = useState('economy');
  const [plane, setPlane] = useState(FLEET[0]);
  const [liked, setLiked] = useState({});
  const [showFleet, setShowFleet] = useState(false);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [confirm, setConfirm] = useState(null);

  const dates = useMemo(buildDates, []);

  const route = findRoute(to) || DESTINATIONS[0];
  const routeKnown = !!findRoute(to);
  const flightDate = date || dates[Math.min(6, dates.length - 1)];
  const cabinPrice = (i) => (routeKnown ? route.prices[i] : [549, 749, 1199][i]);
  const timeLabel = timesFor(routeKnown ? route.dur : 270);
  const toLabel = routeKnown ? route.name : to.trim();

  /* ---------- actions ---------- */
  const swap = () => {
    if (!to.trim()) return;
    const f = from;
    setFrom(to);
    setTo(f);
  };

  const search = () => {
    if (!from.trim()) return setError('Enter a departure city.');
    if (!to.trim()) return setError('Choose a destination to see flights.');
    if (from.trim().toLowerCase() === to.trim().toLowerCase())
      return setError('Departure and destination must be different.');
    setError('');
    setCabin('economy');
    setScreen('details');
  };

  const openPlane = (p) => {
    setPlane(p);
    setScreen('plane');
  };

  const bookFromPlane = () => {
    if (!to.trim()) {
      setTo(DESTINATIONS[0].name);
    }
    setCabin('economy');
    setScreen('details');
  };

  const confirmBooking = () => {
    const idx = CABINS.findIndex((c) => c.id === cabin);
    const booking = {
      ref: makeRef(),
      from: from.trim(),
      to: toLabel || DESTINATIONS[0].name,
      date: fmtDate(flightDate),
      time: timeLabel,
      cabin: CABINS[idx].title,
      price: cabinPrice(idx),
      aircraft: plane.name,
    };
    setBookings((b) => [booking, ...b]);
    setConfirm(booking);
  };

  const closeConfirm = (goToFlights) => {
    setConfirm(null);
    setTo('');
    setDate(null);
    setScreen('main');
    setTab(goToFlights ? 'flights' : 'home');
  };

  const goTab = (t) => {
    setTab(t);
    setScreen('main');
  };

  /* ================================================================ */
  /*  Welcome                                                          */
  /* ================================================================ */
  if (screen === 'welcome') {
    return (
      <View style={{ flex: 1, backgroundColor: '#0E3550' }}>
        <StatusBar barStyle="light-content" />
        <Sky tone="dusk" style={StyleSheet.absoluteFill}>
          <View style={styles.wingWrap} pointerEvents="none">
            <Plane size={260} color="rgba(255,255,255,0.22)" rotate="-35deg" />
          </View>
        </Sky>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1, alignItems: 'center', paddingTop: 48 }}>
            <PineLogo size={74} />
            <Text style={styles.welcomeBrand}>TimberLines</Text>
            <Text style={styles.welcomeTitle}>Fly with{'\n'}TimberLines!</Text>
            <View style={styles.welcomeSubRow}>
              <View style={styles.welcomeRule} />
              <Text style={styles.welcomeSub}>Explore the world{'\n'}with us</Text>
              <View style={styles.welcomeRule} />
            </View>
          </View>
          <View style={{ paddingHorizontal: 28, paddingBottom: 24, alignItems: 'center' }}>
            <PrimaryButton label="Get Started" onPress={() => goTab('home')} style={{ alignSelf: 'stretch' }} />
            <TouchableOpacity onPress={() => goTab('home')} style={{ marginTop: 18 }}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  /* ================================================================ */
  /*  Tab bar                                                          */
  /* ================================================================ */
  const TABS = [
    { id: 'home', label: 'Home', icon: '⌂' },
    { id: 'flights', label: 'My Flights', icon: '✈︎' },
    { id: 'deals', label: 'Deals', icon: '%' },
    { id: 'profile', label: 'Profile', icon: '☺' },
  ];
  const activeTab = screen === 'details' ? 'flights' : tab;
  const TabBar = () => (
    <View style={styles.tabBar}>
      {TABS.map((t) => {
        const on = activeTab === t.id;
        return (
          <TouchableOpacity key={t.id} style={styles.tabItem} onPress={() => goTab(t.id)} activeOpacity={0.7}>
            <Text style={[styles.tabIcon, { color: on ? C.green : '#8A9A93' }]}>{t.icon}</Text>
            <Text style={[styles.tabLabel, { color: on ? C.green : '#8A9A93' }, on && styles.tabLabelOn]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  /* ================================================================ */
  /*  Aircraft card screen                                             */
  /* ================================================================ */
  const renderPlane = () => (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Sky style={{ height: 330 }}>
        <SafeAreaView>
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.roundBtn} onPress={() => setScreen('main')}>
              <Text style={styles.roundBtnText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.roundBtn}
              onPress={() => setLiked((l) => ({ ...l, [plane.id]: !l[plane.id] }))}
            >
              <Text style={[styles.roundBtnText, liked[plane.id] && { color: '#FF6B81' }]}>
                {liked[plane.id] ? '♥' : '♡'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        <View style={{ alignItems: 'center', marginTop: 16 }}>
          <Plane size={150} rotate="-12deg" />
        </View>
      </Sky>
      <View style={styles.sheet}>
        <Text style={styles.planeTitle}>{plane.name}</Text>
        <Text style={styles.planeTag}>{plane.tagline}</Text>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>💺</Text>
            <Text style={styles.statVal}>{plane.seats}</Text>
            <Text style={styles.statLbl}>seats</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statIcon}>⏱</Text>
            <Text style={styles.statVal}>{plane.speed}</Text>
            <Text style={styles.statLbl}>(max)</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statIcon}>🌐</Text>
            <Text style={styles.statVal}>{plane.range}</Text>
            <Text style={styles.statLbl}>ready</Text>
          </View>
        </View>
        <View style={styles.hr} />
        <Text style={styles.planeDesc}>{plane.desc}</Text>
        <View style={{ flex: 1 }} />
        <PrimaryButton label="Book a Flight" onPress={bookFromPlane} />
      </View>
    </View>
  );

  /* ================================================================ */
  /*  Flight details screen                                            */
  /* ================================================================ */
  const renderDetails = () => (
    <View style={{ flex: 1, backgroundColor: '#DCE8F1' }}>
      <SafeAreaView>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.roundBtn} onPress={() => setScreen('main')}>
            <Text style={styles.roundBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.detailsHeader}>Flight Details</Text>
          <View style={{ width: 42 }} />
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 24 }}>
        <View style={{ alignItems: 'center', marginTop: 14 }}>
          <Text style={styles.cityBig}>{from.trim() || 'Kyiv (IEV)'}</Text>
          <View style={styles.routeLineRow}>
            <View style={styles.routeLine} />
            <Text style={{ fontSize: 30, color: C.deep, marginHorizontal: 10 }}>✈︎</Text>
            <View style={styles.routeLine} />
          </View>
          <Text style={styles.cityBig}>{toLabel}</Text>
          <Text style={styles.metaLine}>
            {fmtDate(flightDate)}   •   {timeLabel}
          </Text>
        </View>

        <View style={{ marginTop: 22 }}>
          {CABINS.map((c, i) => {
            const on = cabin === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                activeOpacity={0.9}
                onPress={() => setCabin(c.id)}
                style={[styles.cabinCard, on && styles.cabinCardOn]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.cabinTitle}>{c.title}</Text>
                  <Text style={styles.cabinDesc}>{c.desc}</Text>
                </View>
                <Text style={styles.cabinPrice}>{fmtPrice(cabinPrice(i))}</Text>
                {on && (
                  <View style={styles.check}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <PrimaryButton label="Continue" onPress={confirmBooking} style={{ marginTop: 10 }} />
      </ScrollView>
    </View>
  );

  /* ================================================================ */
  /*  Home tab                                                         */
  /* ================================================================ */
  const renderHome = () => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 24 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.homeHeader}>
        <Wordmark />
        <TouchableOpacity onPress={() => goTab('profile')}>
          <Text style={{ fontSize: 28, color: C.green }}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Banner carousel */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_W - 32}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) =>
          setBannerIdx(Math.round(e.nativeEvent.contentOffset.x / (SCREEN_W - 32)))
        }
        style={{ marginHorizontal: 16 }}
      >
        {BANNERS.map((b, i) => (
          <View key={i} style={{ width: SCREEN_W - 32 }}>
            <View style={[styles.banner, { backgroundColor: b.bg }]}>
              <View style={[styles.cloud, { width: 240, height: 90, right: -60, bottom: -20 }]} />
              <View style={{ position: 'absolute', right: 10, top: 12 }}>
                <Plane size={96} rotate="-8deg" />
              </View>
              <Text style={styles.bannerTitle}>{b.title}</Text>
              <Text style={styles.bannerSub}>{b.sub}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {BANNERS.map((_, i) => (
          <View key={i} style={[styles.dot, i === bannerIdx && styles.dotOn]} />
        ))}
      </View>

      {/* Search card */}
      <View style={styles.searchCard}>
        <View style={styles.fromToRow}>
          <View style={styles.field}>
            <Text style={styles.fieldIcon}>✈︎</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>From</Text>
              <TextInput
                value={from}
                onChangeText={setFrom}
                placeholder="City or airport"
                placeholderTextColor="#9AA9A3"
                style={styles.fieldInput}
                autoCorrect={false}
              />
            </View>
          </View>
          <TouchableOpacity style={styles.swapBtn} onPress={swap}>
            <Text style={{ color: C.green, fontSize: 18 }}>⇄</Text>
          </TouchableOpacity>
          <View style={styles.field}>
            <Text style={styles.fieldIcon}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>To</Text>
              <TextInput
                value={to}
                onChangeText={(t) => {
                  setTo(t);
                  setError('');
                }}
                placeholder="Any destination"
                placeholderTextColor="#9AA9A3"
                style={styles.fieldInput}
                autoCorrect={false}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.dateRow} onPress={() => setDateOpen(true)} activeOpacity={0.8}>
          <Text style={styles.fieldIcon}>📅</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Departure date</Text>
            <Text style={styles.fieldInput}>{date ? fmtDate(date) : 'Any date'}</Text>
          </View>
          <Text style={{ color: C.ink, fontSize: 16 }}>⌄</Text>
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {DESTINATIONS.map((d) => (
            <TouchableOpacity
              key={d.code}
              style={[styles.chip, to === d.name && styles.chipOn]}
              onPress={() => {
                setTo(d.name);
                setError('');
              }}
            >
              <Text style={[styles.chipText, to === d.name && { color: '#fff' }]}>{d.code}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <PrimaryButton label="🔍  Search Flights" onPress={search} style={{ marginTop: 12 }} />
      </View>

      {/* Fleet */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Our Fleet</Text>
        <TouchableOpacity onPress={() => setShowFleet((v) => !v)}>
          <Text style={styles.seeAll}>{showFleet ? 'Show less ↑' : 'See all →'}</Text>
        </TouchableOpacity>
      </View>
      {showFleet ? (
        <View style={{ paddingHorizontal: 16 }}>
          {FLEET.map((p) => (
            <FleetCard key={p.id} p={p} onPress={() => openPlane(p)} full />
          ))}
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {FLEET.map((p) => (
            <FleetCard key={p.id} p={p} onPress={() => openPlane(p)} />
          ))}
        </ScrollView>
      )}
    </ScrollView>
  );

  /* ================================================================ */
  /*  My Flights tab                                                   */
  /* ================================================================ */
  const renderFlights = () => (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
      <Text style={styles.pageTitle}>My Flights</Text>
      {bookings.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 44, color: C.emerald }}>✈︎</Text>
          <Text style={styles.emptyTitle}>No trips booked yet</Text>
          <Text style={styles.emptyText}>Search for a flight and your tickets will appear here.</Text>
          <PrimaryButton label="Find a flight" onPress={() => goTab('home')} style={{ alignSelf: 'stretch', marginTop: 16 }} />
        </View>
      ) : (
        bookings.map((b) => (
          <View key={b.ref} style={styles.ticket}>
            <View style={styles.ticketTop}>
              <Text style={styles.ticketRoute}>
                {b.from.split(' ')[0]}  ✈︎  {b.to.split(' ')[0]}
              </Text>
              <Text style={styles.ticketPrice}>{fmtPrice(b.price)}</Text>
            </View>
            <Text style={styles.ticketLine}>{b.from} → {b.to}</Text>
            <Text style={styles.ticketLine}>{b.date}  •  {b.time}</Text>
            <View style={styles.ticketBottom}>
              <View>
                <Text style={styles.ticketSmall}>Cabin</Text>
                <Text style={styles.ticketVal}>{b.cabin}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.ticketSmall}>Booking</Text>
                <Text style={[styles.ticketVal, { letterSpacing: 1.5 }]}>{b.ref}</Text>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  /* ================================================================ */
  /*  Deals tab                                                        */
  /* ================================================================ */
  const renderDeals = () => (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
      <Text style={styles.pageTitle}>Deals</Text>
      <Text style={styles.pageSub}>Fares from Kyiv. Tap a deal to prefill your search.</Text>
      {DEALS.map((d) => (
        <TouchableOpacity
          key={d.id}
          activeOpacity={0.9}
          style={styles.deal}
          onPress={() => {
            setFrom('Kyiv (IEV)');
            setTo(d.to);
            setError('');
            goTab('home');
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.dealTo}>{d.to}</Text>
            <Text style={styles.dealNote}>{d.note}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={styles.dealTag}>
              <Text style={styles.dealTagText}>{d.tag}</Text>
            </View>
            <Text style={styles.dealPrice}>from {fmtPrice(d.price)}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  /* ================================================================ */
  /*  Profile tab                                                      */
  /* ================================================================ */
  const renderProfile = () => (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
      <Text style={styles.pageTitle}>Profile</Text>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={{ color: '#fff', fontSize: 26, fontWeight: '700' }}>OK</Text>
        </View>
        <View style={{ marginLeft: 14 }}>
          <Text style={styles.profileName}>Oleksandr Kovalenko</Text>
          <Text style={styles.profileMail}>o.kovalenko@example.com</Text>
        </View>
      </View>
      <View style={styles.statsCard}>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={styles.bigNum}>{bookings.length}</Text>
          <Text style={styles.statLbl}>Trips booked</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={styles.bigNum}>{bookings.length * 1200}</Text>
          <Text style={styles.statLbl}>Timber Miles</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.logout} onPress={() => setScreen('welcome')}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  /* ================================================================ */
  /*  Main layout                                                      */
  /* ================================================================ */
  let body;
  if (screen === 'plane') body = renderPlane();
  else if (screen === 'details') body = renderDetails();
  else if (tab === 'home') body = renderHome();
  else if (tab === 'flights') body = renderFlights();
  else if (tab === 'deals') body = renderDeals();
  else body = renderProfile();

  const lightHeader = screen === 'plane' || screen === 'details';

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle={lightHeader ? 'light-content' : 'dark-content'} />
      {screen === 'main' ? <SafeAreaView style={{ flex: 1 }}>{body}</SafeAreaView> : <View style={{ flex: 1 }}>{body}</View>}
      <SafeAreaView style={{ backgroundColor: '#fff' }}>
        <TabBar />
      </SafeAreaView>

      {/* Date picker */}
      <Modal visible={dateOpen} transparent animationType="slide" onRequestClose={() => setDateOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHead}>
              <Text style={styles.sectionTitle}>Departure date</Text>
              <TouchableOpacity onPress={() => setDateOpen(false)}>
                <Text style={styles.seeAll}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TouchableOpacity
                style={[styles.dateItem, !date && styles.dateItemOn]}
                onPress={() => {
                  setDate(null);
                  setDateOpen(false);
                }}
              >
                <Text style={[styles.dateText, !date && { color: '#fff' }]}>Any date</Text>
              </TouchableOpacity>
              {dates.map((d) => {
                const on = date && date.getTime() === d.getTime();
                return (
                  <TouchableOpacity
                    key={d.getTime()}
                    style={[styles.dateItem, on && styles.dateItemOn]}
                    onPress={() => {
                      setDate(d);
                      setDateOpen(false);
                    }}
                  >
                    <Text style={[styles.dateText, on && { color: '#fff' }]}>{fmtDate(d)}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Booking confirmation */}
      <Modal visible={!!confirm} transparent animationType="fade" onRequestClose={() => closeConfirm(false)}>
        <View style={[styles.backdrop, { justifyContent: 'center', padding: 24 }]}>
          {confirm && (
            <View style={styles.confirmCard}>
              <View style={styles.bigCheck}>
                <Text style={{ color: '#fff', fontSize: 34, fontWeight: '800' }}>✓</Text>
              </View>
              <Text style={styles.confirmTitle}>Booking confirmed</Text>
              <Text style={styles.confirmSub}>Your ticket is saved in My Flights.</Text>
              <View style={styles.refBox}>
                <Text style={styles.ticketSmall}>Booking number</Text>
                <Text style={styles.refText}>{confirm.ref}</Text>
              </View>
              <Text style={styles.confirmLine}>{confirm.from} → {confirm.to}</Text>
              <Text style={styles.confirmLine}>{confirm.date}</Text>
              <Text style={styles.confirmLine}>{confirm.time}  •  {confirm.cabin}</Text>
              <Text style={[styles.confirmLine, { fontWeight: '800', fontSize: 20, marginTop: 8 }]}>
                {fmtPrice(confirm.price)}
              </Text>
              <PrimaryButton label="View My Flights" onPress={() => closeConfirm(true)} style={{ alignSelf: 'stretch', marginTop: 18 }} />
              <TouchableOpacity onPress={() => closeConfirm(false)} style={{ marginTop: 14 }}>
                <Text style={styles.seeAll}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Fleet card                                                         */
/* ------------------------------------------------------------------ */
function FleetCard({ p, onPress, full }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.fleetCard, full && { width: '100%', marginRight: 0, marginBottom: 12 }]}
    >
      <Sky style={{ height: 110 }}>
        <View style={{ alignItems: 'center', marginTop: 4 }}>
          <Plane size={74} rotate="-10deg" />
        </View>
      </Sky>
      <View style={{ padding: 12 }}>
        <Text style={styles.fleetName}>{p.name}</Text>
        <Text style={styles.fleetMeta}>{p.seats} seats  •  {p.range}</Text>
      </View>
    </TouchableOpacity>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */
const shadow = Platform.select({
  ios: {
    shadowColor: '#0F3A2F',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  default: { elevation: 4 },
});

const styles = StyleSheet.create({
  cloud: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 100,
  },

  /* welcome */
  wingWrap: { position: 'absolute', right: -40, bottom: 120 },
  welcomeBrand: { color: '#fff', fontSize: 20, fontWeight: '700', fontStyle: 'italic', marginTop: 8 },
  welcomeTitle: {
    color: '#fff',
    fontSize: 44,
    fontWeight: '800',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 54,
    lineHeight: 52,
  },
  welcomeSubRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, paddingHorizontal: 24 },
  welcomeRule: { width: 44, height: 1, backgroundColor: 'rgba(255,255,255,0.5)' },
  welcomeSub: { color: 'rgba(255,255,255,0.85)', fontSize: 18, textAlign: 'center', marginHorizontal: 14 },
  loginLink: { color: '#fff', fontSize: 17, textDecorationLine: 'underline' },

  /* shared */
  primaryBtn: {
    backgroundColor: C.green,
    borderRadius: 28,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 6,
  },
  roundBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(15,40,70,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBtnText: { color: '#fff', fontSize: 22, fontWeight: '600' },
  pageTitle: { fontSize: 30, fontWeight: '800', color: C.ink, marginBottom: 6 },
  pageSub: { color: C.muted, fontSize: 15, marginBottom: 16 },
  hr: { height: 1, backgroundColor: C.line, marginVertical: 14 },

  /* tab bar */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 8,
    paddingBottom: 4,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 24 },
  tabLabel: { fontSize: 12, marginTop: 2 },
  tabLabelOn: { fontWeight: '800', textDecorationLine: 'underline' },

  /* home */
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  banner: {
    height: 210,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 20,
  },
  bannerTitle: { color: '#fff', fontSize: 32, fontWeight: '800', lineHeight: 38 },
  bannerSub: { color: 'rgba(255,255,255,0.9)', fontSize: 16, marginTop: 6 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#CBD6D1', marginHorizontal: 4 },
  dotOn: { width: 24, backgroundColor: C.green },

  searchCard: {
    backgroundColor: C.card,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 12,
    ...shadow,
  },
  fromToRow: { flexDirection: 'row', alignItems: 'center' },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.line,
  },
  fieldIcon: { fontSize: 20, marginRight: 8, color: C.green },
  fieldLabel: { fontSize: 12, color: C.muted },
  fieldInput: { fontSize: 15, fontWeight: '600', color: C.ink, paddingVertical: 2, padding: 0 },
  swapBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -8,
    zIndex: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: C.line,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: C.mist,
    marginRight: 8,
  },
  chipOn: { backgroundColor: C.emerald },
  chipText: { color: C.green, fontWeight: '700', fontSize: 13 },
  error: { color: '#B3261E', marginTop: 10, fontSize: 14 },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: C.ink },
  seeAll: { color: C.green, fontWeight: '700', fontSize: 15 },
  fleetCard: {
    width: 230,
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 12,
    ...shadow,
  },
  fleetName: { fontSize: 17, fontWeight: '800', color: C.ink },
  fleetMeta: { color: C.muted, marginTop: 3, fontSize: 13 },

  /* plane screen */
  sheet: {
    flex: 1,
    marginTop: -28,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    paddingBottom: 16,
  },
  planeTitle: { fontSize: 30, fontWeight: '800', color: C.ink },
  planeTag: { fontSize: 17, color: C.muted, marginTop: 4 },
  statRow: { flexDirection: 'row', marginTop: 20 },
  stat: { flex: 1, alignItems: 'center' },
  statIcon: { fontSize: 24 },
  statVal: { fontSize: 15, color: C.ink, marginTop: 6, fontWeight: '600' },
  statLbl: { fontSize: 14, color: C.muted },
  statDivider: { width: 1, backgroundColor: C.line },
  planeDesc: { fontSize: 16, lineHeight: 24, color: '#40524A' },

  /* details */
  detailsHeader: { fontSize: 20, fontWeight: '700', color: C.ink },
  cityBig: { fontSize: 28, fontWeight: '800', color: C.ink, textAlign: 'center' },
  routeLineRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  routeLine: { width: 36, height: 1, backgroundColor: 'rgba(15,58,47,0.3)' },
  metaLine: { marginTop: 14, fontSize: 16, color: C.ink },
  cabinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadow,
  },
  cabinCardOn: { borderColor: C.green, backgroundColor: '#F3FAF7' },
  cabinTitle: { fontSize: 20, fontWeight: '800', color: C.ink },
  cabinDesc: { fontSize: 15, color: '#40524A', marginTop: 4, lineHeight: 20 },
  cabinPrice: { fontSize: 26, fontWeight: '800', color: C.ink },
  check: {
    position: 'absolute',
    top: -12,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3FAE7A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  checkText: { color: '#fff', fontWeight: '800', fontSize: 17 },

  /* my flights */
  empty: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 28, marginTop: 10, ...shadow },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.ink, marginTop: 8 },
  emptyText: { color: C.muted, textAlign: 'center', marginTop: 6, fontSize: 15 },
  ticket: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginTop: 12, ...shadow },
  ticketTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ticketRoute: { fontSize: 22, fontWeight: '800', color: C.green },
  ticketPrice: { fontSize: 20, fontWeight: '800', color: C.ink },
  ticketLine: { color: '#40524A', fontSize: 15, marginTop: 3 },
  ticketBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: C.line,
    marginTop: 14,
    paddingTop: 12,
    borderStyle: 'dashed',
  },
  ticketSmall: { fontSize: 12, color: C.muted },
  ticketVal: { fontSize: 16, fontWeight: '700', color: C.ink, marginTop: 2 },

  /* deals */
  deal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: C.emerald,
    ...shadow,
  },
  dealTo: { fontSize: 19, fontWeight: '800', color: C.ink },
  dealNote: { color: C.muted, marginTop: 3, fontSize: 14 },
  dealTag: { backgroundColor: C.mist, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  dealTagText: { color: C.green, fontWeight: '800', fontSize: 13 },
  dealPrice: { fontSize: 17, fontWeight: '800', color: C.ink, marginTop: 6 },

  /* profile */
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 18, ...shadow },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  profileName: { fontSize: 19, fontWeight: '800', color: C.ink },
  profileMail: { color: C.muted, marginTop: 3 },
  statsCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 20, marginTop: 14, ...shadow },
  bigNum: { fontSize: 28, fontWeight: '800', color: C.green },
  logout: { marginTop: 20, alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1.5, borderColor: C.green },
  logoutText: { color: C.green, fontWeight: '800', fontSize: 16 },

  /* modals */
  backdrop: { flex: 1, backgroundColor: 'rgba(8,24,18,0.55)', justifyContent: 'flex-end' },
  pickerSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 18,
    maxHeight: '70%',
  },
  pickerHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  dateItem: { paddingVertical: 14, paddingHorizontal: 14, borderRadius: 12, marginBottom: 6, backgroundColor: C.bg },
  dateItemOn: { backgroundColor: C.green },
  dateText: { fontSize: 16, color: C.ink, fontWeight: '600' },
  confirmCard: { backgroundColor: '#fff', borderRadius: 26, padding: 24, alignItems: 'center' },
  bigCheck: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#3FAE7A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  confirmTitle: { fontSize: 24, fontWeight: '800', color: C.ink },
  confirmSub: { color: C.muted, marginTop: 4, marginBottom: 16 },
  refBox: { alignSelf: 'stretch', alignItems: 'center', backgroundColor: C.mist, borderRadius: 16, padding: 14, marginBottom: 14 },
  refText: { fontSize: 30, fontWeight: '800', color: C.green, letterSpacing: 3, marginTop: 2 },
  confirmLine: { fontSize: 16, color: '#40524A', marginTop: 3, textAlign: 'center' },
});
