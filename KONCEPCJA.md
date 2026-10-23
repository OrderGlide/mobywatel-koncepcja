# mObywatel pod Twoją kontrolą

Koncepcja na mObywatel Challenge. Klikalny prototyp z fikcyjnymi danymi.

## Jedno zdanie

Asystent, który załatwia sprawy za Ciebie, ale nigdy bez Ciebie: każdą decyzję widać, każde udostępnienie danych da się cofnąć, a granic asystenta nie zmieni żadna rozmowa.

## Problem

Asystent AI w aplikacji państwowej to ogromna wygoda i ogromne ryzyko. Model językowy da się namówić, pomylić albo oszukać treścią z zewnątrz (SMS, mail, strona). Obywatel nie wie, kto czytał jego dane, ani dlaczego asystent coś zaproponował.

## Pięć filarów

1. **Podpisujesz to, co widzisz.** Każda czynność (pismo, płatność, umowa, udostępnienie danych) to karta z dokładną treścią i kodem czynności. Podpisujesz ją kluczem urządzenia (passkey). Oczekujące czynności przechowuje serwer państwa, nie telefon, więc nie da się podrzucić innej treści niż ta na karcie.
2. **Granice w kodzie, nie w rozmowie.** Zasady typu "płatność zawsze wymaga podpisu" są zwykłym kodem. Asystent ich nie zna jako prośby, tylko jako ścianę. Treść SMS-ów, maili i stron trafia do niego oznaczona jako dane, nigdy jako polecenia.
3. **Ślad każdej sprawy.** Przycisk "Ślad" pokazuje cały łańcuch: Twoja prośba, co asystent sprawdził i w jakim rejestrze, jaka reguła zadziałała, co podpisałaś, co zrobił urząd.
4. **Moje dane: kto, kiedy, po co.** Dziennik każdego odczytu Twoich danych (urzędy, policja, firmy, asystent) z podstawą prawną. Każdą zgodę cofasz jednym ruchem, bez podpisu: łatwiej zabrać niż dać. Pokazujesz tylko tyle, ile trzeba (np. "mam 18 lat" zamiast całego dowodu).
5. **Życie, nie urzędy.** Zdarzenia życiowe zamiast listy usług: "Sprzedaję auto" to jedna sprawa zamiast czterech. Do tego sprawy bliskich: pełnomocnictwa z zakresem i terminem, a osoba, w której imieniu działasz, widzi każdy Twój krok.

## Scenariusze w prototypie

| Scenariusz | Co pokazuje |
|---|---|
| Sprzedaję auto | zdarzenie życiowe, plan krok po kroku, umowa podpisywana przez obie strony, zgłoszenie zbycia |
| Zgubiłam portfel | szybkie zastrzeżenie dokumentów, wniosek o nowy dowód |
| Recepty mamy | pełnomocnictwo z zakresem, powiadomienie mamy |
| Podejrzany SMS | treść z zewnątrz jako dane, próba wydania polecenia asystentowi, zgłoszenie oszustwa |
| OC się kończy | czynność bez podpisu (przypomnienie) obok czynności z podpisem |
| Rodzi się dziecko, Przeprowadzam się | plan zdarzenia życiowego |
| Pokaż dowód | selektywne ujawnienie: tylko pełnoletność, tylko imię i zdjęcie albo pełne dane |

## Jak to działa technicznie (propozycja dla prawdziwej aplikacji)

- Model językowy jest wymienny i nie podejmuje decyzji o uprawnieniach. Proponuje czynność, a serwer sprawdza ją regułami i zapisuje jako oczekującą.
- Telefon podpisuje skrót dokładnej treści czynności kluczem z bezpiecznego układu urządzenia. Serwer wykonuje tylko czynność, której skrót się zgadza.
- Każdy krok to wpis w dzienniku z identyfikatorem sprawy i poprzedniego kroku, więc da się odtworzyć łańcuch od prośby do skutku.
- Dziennik dostępu zasilają rejestry państwowe, a nie aplikacja, więc pokazuje także odczyty, o których obywatel nie wiedział.

## Prototyp

Plik `index.html`, bez serwera, bez kont i bez zewnętrznych zasobów (żadnych czcionek, skryptów ani trackerów z sieci). Asystent działa na przygotowanych scenariuszach.

Osoby i dane są fikcyjne. To nie jest aplikacja mObywatel ani usługa administracji publicznej. Prototyp nie używa godła ani oficjalnych oznaczeń mObywatela.
