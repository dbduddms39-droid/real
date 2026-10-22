# 아이폰 UI 조사와 반영

## 확인한 자료 — 2026-10-22

사용자가 네트워크 허용을 변경한 뒤 다시 요청하여, 아래 검색·기사·이미지를 실제로 읽고 비교했습니다. 이번 UI의 비교 기준은 **iOS 26**이며, 전체 최신 버전의 픽셀 단위 복제라고 주장하지 않습니다.

1. [DuckDuckGo 검색](https://html.duckduckgo.com/html/?q=iOS%2026%20home%20screen%20control%20center%20screenshots)
   - iOS 26 홈 화면·제어 센터를 검색해 Apple 지원 안내, AppleInsider 설명, 사용자 스크린샷 스레드 등의 결과를 확인했습니다. 결과에 나온 모든 사이트 본문을 읽은 것은 아닙니다. Google은 HTML을 반환했으나 검색 결과 대신 리디렉션 안내였고, Bing은 관련 없는 결과를 반환하여 근거에서 제외했습니다.
2. [MacRumors iOS 26 정리](https://www.macrumors.com/roundup/ios-26/)
   - Liquid Glass의 여러 층 아이콘, Clear 사용자화, 커진 잠금 시계, 둥근 단일 버튼, 더 넓은 설정 여백에 관한 본문을 읽었습니다. 별도 가이드 페이지와 이미지 호스트는 접근이 거절되어 그 내용은 확인했다고 주장하지 않습니다.
3. [Apple iOS 26 발표 자료](https://www.apple.com/newsroom/2025/06/apple-elevates-the-iphone-experience-with-ios-26/)
   - [홈 화면의 Clear·Dark·기본 색상 비교 이미지](https://www.apple.com/newsroom/images/2025/06/apple-elevates-the-iphone-experience-with-ios-26/article/Apple-WWDC25-iOS-26-Home-Screen-customization-250609_big.jpg.large.jpg)를 내려받아 직접 확인했습니다.
   - [홈 화면·잠금 화면 예시 이미지](https://www.apple.com/newsroom/images/2025/06/apple-elevates-the-iphone-experience-with-ios-26/article/Apple-WWDC25-iOS-26-hero-250609_big.jpg.large.jpg)를 확인했습니다.
4. [Apple iPhone 안내: 제어 센터, iOS 26 지정](https://support.apple.com/guide/iphone/iph59095ec58/26/ios/26)
   - 현재 버전으로 연결되는 기본 URL 대신 버전 선택에 제공되는 iOS 26 URL을 사용했습니다.
   - [iOS 26 제어 센터 이미지](https://help.apple.com/assets/69F8EBBDF3B89A4F6E0C704C/69F8EBC43862495245036393/en_US/6a01789ded87e5af7dbf18ba2c85756c.png)를 내려받아 직접 확인했습니다.

## 비교 결과와 구현

| 확인한 차이 | 반영한 내용 |
| --- | --- |
| 예시 홈 화면은 위젯 아래 4열 × 4행 앱 구성 | 첫 페이지를 16개 앱과 같은 순서로 구성하고 작은 화면에서도 독과 겹치지 않게 조정 |
| 홈 화면에 기본 색상·다크·Clear 모양이 존재 | 홈 빈 공간 길게 누르기 또는 설정에서 사용자화, 세 가지 아이콘·위젯 모양 제공 |
| 크게 설정한 앱 아이콘은 이름을 표시하지 않는 방식 | 작은·큰 아이콘 전환, 큰 아이콘에서 라벨 숨김 |
| Clear 모드는 기존 색상 아이콘을 단순히 회색으로 만든 것과 다름 | 투명한 바탕과 흰 반투명 벡터 레이어로 별도 처리 |
| 잠금 화면 시계가 길고 얇으며 유리 재질에 가까움 | 얇고 길게 확장한 반투명 시계로 조정 |
| 제어 센터의 작은 단일 제어 버튼은 원형 | 방향 잠금·빠른 실행 버튼을 원형으로 조정 |
| 연결 패널에 큰 버튼과 작은 연결 상태 버튼이 함께 배치됨 | 비행기·AirDrop·Wi-Fi와 셀룰러·Bluetooth·핫스팟·VPN 배치 |

사용자화 설정은 브라우저에 저장합니다. 화면은 CSS로 구성합니다. 기본 앱 아이콘은 아래 추가 작업에 명시한 Apple 원본 PNG를 사용하며, 작은 인터페이스 기호만 직접 그린 SVG입니다. 참고용 전체 화면 스크린샷은 배포 파일에 포함하지 않습니다. 네이티브 굴절 셰이더, 사진 피사체에 따른 시계 자동 크기 조정, 3D 공간 배경, 실제 iOS 기능 전체를 재현한 것은 아닙니다.

## 기존 웹 구현 참고 자료

이전 접근 제한 시 확인한 [GlassKit](https://github.com/JUNGHERZ/GlassKit), [liquid-glass-cli](https://github.com/aryankholqi/liquid-glass-cli), [Capacitor Liquid Glass](https://github.com/anthonyjuarezsolis/capacitor-liquid-glass)는 웹·네이티브 재현 방식 구분을 위한 보조 자료입니다. 이 프로젝트들의 데모를 실제 아이폰 OS 스크린샷으로 취급하지 않습니다. 외부 소스 코드나 의존성을 복사·설치하지 않았습니다.

## 기능 범위와 검증

메모 저장, 계산기, 시계·캘린더, 검색, 샘플 사진 확대, 미리 알림 입력, 잠금·해제, 사용자화 및 제어 센터 조작을 제공합니다. 날씨·연결·음량·손전등은 시뮬레이션이며 기기 OS나 실제 Apple 서비스는 제어하지 않습니다. 미구현 앱은 미리보기라고 표시합니다.

Chromium에서 모바일 크기별 배치, 주요 동작, 사용자화 저장·복원, 아이콘 크기와 이름 표시 전환을 확인합니다. 실제 iPhone Safari에서의 기기 테스트와 최신 iOS 전체 기능 검증은 별도입니다.


## 기본 앱 아이콘 원본 교체 — 2026-10-22

사용자 요청에 따라 단순화해 그린 앱 아이콘을 제거하고 **Apple 공식 페이지에서 받은 26개 PNG 원본**으로 교체했습니다.

- 주 출처: [Apple Apps](https://www.apple.com/apps/) 페이지의 실제 이미지 주소와 2배 해상도 자원. 사진, 카메라, 설정, Safari, 지도, App Store 등 기본 앱의 원본 형태와 디테일을 사용합니다.
- 캘린더·시계·연락처의 iPhone 형태: iOS 26으로 버전을 지정한 Apple iPhone 사용 설명서의 아이콘 자원을 사용합니다.
- 파일별 원본 URL, 크기, 표시 영역, SHA-256은 [assets/icons/sources.json](assets/icons/sources.json)에 기록했습니다. 받은 PNG 파일의 픽셀을 수정하지 않고 원본 파일 그대로 보관합니다.
- 웹 페이지 소개용 PNG에 포함된 투명 여백은 SVG 표시 영역으로 정규화하여 아이콘들의 실제 표시 크기를 맞췄습니다. 원본에는 이미 하이라이트와 모서리 모양이 있으므로 기존의 인위적인 테두리·광택 효과는 제거했습니다.
- 캘린더의 요일·날짜와 시계 숫자판·바늘은 원본 외형 위에 라이브 SVG 표시를 얹어 현재 기기 날짜와 시간을 유지합니다. 이 두 아이콘은 정적인 PNG만 표시하는 것이 아닙니다.
- 라이트 모드는 원본 색상입니다. 다크·투명 모드는 같은 원본 윤곽을 SVG 색상 필터로 변환한 웹 재현이며, Apple이 제공한 별도의 네이티브 다크·투명 에셋과 완전히 동일하다고 주장하지 않습니다.
- `build-icons.py`가 PNG 체크섬을 검증하고 `icon-assets.js`를 만듭니다. `export.py`도 이 과정을 실행하므로 단일 HTML과 배포 ZIP에 모든 이미지가 포함됩니다. 실행 중 외부 이미지 서버 접속이 필요하지 않습니다.

아이콘 및 Apple 상표의 권리는 Apple에 있습니다. 이 프로젝트가 Apple 공식 제품이라고 표시하지 않습니다.


## 업로드 음원 내장 — 2026-10-22

사용자가 첨부한 오반의 「어떻게 지내 (Prod. By VAN.C)」 MP3 원본을 `assets/audio/ovan-how-are-you.mp3`로 보관했습니다. 재인코딩하지 않았으며 출처와 SHA-256은 `assets/audio/track.json`에 있습니다. 같은 MP3 안에 포함된 JPEG 커버를 스트림 복사로 추출해 임시 제목 아트워크 대신 표시합니다.

음원과 커버는 `build-music.py`에서 무결성을 검증해 생성한 `music-assets.js`와 단일 HTML에 내장합니다. 시작 화면은 홈 화면입니다. 화면이 보이기 시작한 뒤 2초 후 음악 아이콘에서 앱이 확대되어 열리며, 직접 다른 앱이나 제어 센터를 열면 자동 전환을 취소합니다. 홈 화면에서는 음원만 미리 불러오며, 음악 앱이 열리는 순간 재생을 시도합니다. 자동 재생이 거절되면 소리 켜기 버튼을 표시하고 화면 또는 재생 버튼 한 번의 사용자 동작으로 처리합니다. 웹 배포는 음원을 직접 MP3로 제공하고, 내장 음원은 단일 HTML에 유지합니다. 웹 자원에는 내용별 버전을 붙이며, 배경 탭 시간은 전환 대기에서 제외합니다. 자동 재생 제한을 우회하지 않습니다. 공개 배포에는 이 음원 번들이 포함됩니다.


모바일 배치는 특정 제조사나 모델에 맞추지 않고 390px을 디자인 기준으로 사용합니다. 360~430px 화면 폭과 사용 가능한 높이·상하 안전 영역에 따라 아이콘, 위젯, 행 간격, 독 여백을 조절하고, 높이가 작은 화면은 간격을 줄여 네 줄의 앱과 독이 겹치지 않게 합니다.
