$(document).ready(function () {
    const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));

    // Leaflet Map Variables
    let modalMap, modalMarker;
    let mapTarget = 'pickup'; // 'pickup' or 'drop'

    const modalCoords = {
        pickup: null,
        drop: null
    };

    function updateModalDistance() {
        if (modalCoords.pickup && modalCoords.drop) {
            const km = calculateDistance(
                modalCoords.pickup.lat, modalCoords.pickup.lng,
                modalCoords.drop.lat, modalCoords.drop.lng
            );
            const distance = Math.round(km);
            $('#modal-distance').val(distance);
            $('#modal-distance-display').text(`Distance: ${distance} KM`);

            // Calculate price
            const carType = $('#modal-car-model').val();
            const rates = {
                'Sedan': 14,
                'MUV-Xylo': 18,
                'MUV-Innova': 19
            };
            const rate = rates[carType] || 0;
            const price = distance * rate;

            if (price > 0) {
                $('#modal-price').val(price);
                $('#modal-price-display').text(`Estimated Price: ₹${price.toLocaleString('en-IN')}`);
            } else {
                $('#modal-price-display').text('');
            }
        } else {
            $('#modal-distance-display').text('');
            $('#modal-price-display').text('');
        }
    }

    // Re-use calculateDistance from index.html if available, or define it
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function initModalMap() {
        if (!modalMap && typeof L !== 'undefined') {
            const defaultLoc = [11.0168, 76.9558]; // Coimbatore
            modalMap = L.map('modal-map-canvas').setView(defaultLoc, 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(modalMap);

            modalMarker = L.marker(defaultLoc, {
                draggable: true
            }).addTo(modalMap);

            // Map Click Event
            modalMap.on('click', function (e) {
                placeMarkerAndGetAddress(e.latlng);
            });

            // Marker Drag Event
            modalMarker.on('dragend', function (e) {
                placeMarkerAndGetAddress(e.target.getLatLng());
            });
        }
    }

    function placeMarkerAndGetAddress(latlng) {
        modalMarker.setLatLng(latlng);
        modalMap.panTo(latlng);

        // Update modal coords
        modalCoords[mapTarget] = { lat: latlng.lat, lng: latlng.lng };
        updateModalDistance();

        // Use Free Nominatim API for reverse geocoding
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data && data.display_name) {
                    if (mapTarget === 'pickup') {
                        $('#modal-pickup-address').val(data.display_name);
                        $('#modal-from-location').val(data.display_name);
                    } else {
                        $('#modal-drop-address').val(data.display_name);
                        $('#modal-to-location').val(data.display_name);
                    }
                }
            })
            .catch(err => console.error('Geocoding error:', err));
    }

    // Toggle Map for Pickup
    $('#modal-btn-map').on('click', function () {
        mapTarget = 'pickup';
        const $container = $('#modal-map-container');

        // If map is already visible and we were targeting drop, just move marker
        if ($container.is(':visible') && mapTarget === 'pickup') {
            if (modalCoords.pickup) {
                modalMarker.setLatLng(modalCoords.pickup);
                modalMap.panTo(modalCoords.pickup);
            }
            return;
        }

        $container.slideDown(300, function () {
            initModalMap();
            setTimeout(() => {
                modalMap.invalidateSize();
                if (modalCoords.pickup) {
                    modalMarker.setLatLng(modalCoords.pickup);
                    modalMap.panTo(modalCoords.pickup);
                }
            }, 100);
        });
    });

    // Toggle Map for Drop
    $('#modal-btn-map-drop').on('click', function () {
        mapTarget = 'drop';
        const $container = $('#modal-map-container');

        $container.slideDown(300, function () {
            initModalMap();
            setTimeout(() => {
                modalMap.invalidateSize();
                if (modalCoords.drop) {
                    modalMarker.setLatLng(modalCoords.drop);
                    modalMap.panTo(modalCoords.drop);
                }
            }, 100);
        });
    });

    // Handle Geolocation (Find Me)
    $('#modal-btn-locate').on('click', function () {
        if (navigator.geolocation) {
            mapTarget = 'pickup';
            $(this).find('i').addClass('fa-spin');
            navigator.geolocation.getCurrentPosition(function (position) {
                const latlng = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                $('#modal-btn-locate i').removeClass('fa-spin');

                if (!$('#modal-map-container').is(':visible')) {
                    $('#modal-map-container').slideDown();
                    initModalMap();
                }

                setTimeout(() => placeMarkerAndGetAddress(latlng), 500);

            }, function () {
                $('#modal-btn-locate i').removeClass('fa-spin');
                alert('Error: Geolocation failed.');
            });
        } else {
            alert('Error: Your browser doesn\'t support geolocation.');
        }
    });

    // Address Search (Autocomplete) Logic
    function initAutocomplete(inputId, targetKey) {
        let searchTimeout;
        const $searchInput = $(`#${inputId}`);
        const $dropdown = $('<div class="address-dropdown"></div>').insertAfter($('.input-group', $searchInput.parent()));

        $searchInput.on('input', function () {
            const query = $(this).val();
            clearTimeout(searchTimeout);

            if (query.length < 3) {
                $dropdown.hide();
                return;
            }

            searchTimeout = setTimeout(() => {
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`)
                    .then(response => response.json())
                    .then(data => {
                        $dropdown.empty();
                        if (data && data.length > 0) {
                            data.forEach(item => {
                                const $item = $('<div class="dropdown-item pointer"></div>').text(item.display_name);
                                $item.on('click', function () {
                                    $searchInput.val(item.display_name);
                                    if (targetKey === 'pickup') $('#modal-from-location').val(item.display_name);
                                    else $('#modal-to-location').val(item.display_name);

                                    $dropdown.hide();

                                    const latlng = { lat: parseFloat(item.lat), lng: parseFloat(item.lon) };
                                    modalCoords[targetKey] = latlng;
                                    updateModalDistance();

                                    // Update Map if visible
                                    if ($('#modal-map-container').is(':visible')) {
                                        mapTarget = targetKey;
                                        modalMarker.setLatLng(latlng);
                                        modalMap.panTo(latlng);
                                    }
                                });
                                $dropdown.append($item);
                            });
                            $dropdown.show();
                        } else {
                            $dropdown.hide();
                        }
                    })
                    .catch(err => console.error('Address search error:', err));
            }, 500);
        });

        // Close dropdown when clicking outside
        $(document).on('click', function (e) {
            if (!$(e.target).closest($dropdown).length && !$(e.target).is($searchInput)) {
                $dropdown.hide();
            }
        });
    }

    initAutocomplete('modal-pickup-address', 'pickup');
    initAutocomplete('modal-drop-address', 'drop');

    // Handle "Find a Vehicle" button clicks
    $('#btn-submit-drop, #btn-submit-round, #btn-submit-package').on('click', function (e) {
        e.preventDefault();
        const btnId = $(this).attr('id');
        let data = {};

        if (btnId === 'btn-submit-drop') {
            data = {
                trip_type: 'Drop Trip',
                car_model: $('input[name="Car_Type"]:checked').val(),
                date: $('#date-picker').val(),
                time: $('#pickup-time').val(),
                return_date: $('#date-picker-2').val(),
                return_time: $('#collection-time').val(),
                pickup: $('#autocomplete').val(),
                drop: $('#autocomplete2').val(),
                distance: $('#distanceOutput').text().replace('Distance: ', '').replace(' KM', ''),
                price: $('#priceOutput').text().replace('Estimated Price: ₹', '').replace(/,/g, ''),
                from_location: $('#autocomplete').val(),
                to_location: $('#autocomplete2').val()
            };
        } else if (btnId === 'btn-submit-round') {
            data = {
                trip_type: 'Round Trip',
                car_model: $('#tab-round input[name="Car_Type"]:checked').val(),
                date: $('#round-date-picker').val(),
                time: $('#round-pickup-time').val(),
                return_date: $('#round-return-date-picker').val(),
                return_time: $('#round-return-time').val(),
                pickup: $('#round-autocomplete-from').val(),
                drop: $('#round-autocomplete-to').val(),
                distance: $('#round-distanceOutput').text().replace('Distance: ', '').replace(' KM', ''),
                price: $('#round-priceOutput').text().replace('Estimated Price: ₹', '').replace(/,/g, ''),
                from_location: $('#round-autocomplete-from').val(),
                to_location: $('#round-autocomplete-to').val()
            };
        } else if (btnId === 'btn-submit-package') {
            data = {
                trip_type: 'Package',
                car_model: $('input[name="Car_Type_Pkg"]:checked').val(),
                date: $('#package-date-picker').val(),
                time: $('#package-pickup-time').val(),
                return_date: '',
                return_time: '',
                pickup: ($('#package-city option:selected').text() || '') + ' - ' + ($('#package-from option:selected').text() || ''),
                drop: $('#package-to option:selected').text() || '',
                distance: $('#package-distance-display div').first().text().replace('Distance: ', '').replace(' KM', ''),
                price: $('#package-price-display').text().replace('Estimated Price: ₹', '').replace(/,/g, ''),
                from_location: ($('#package-city option:selected').text() || '') + ' - ' + ($('#package-from option:selected').text() || ''),
                to_location: $('#package-to option:selected').text() || ''
            };
        }

        // Pre-fill Modal
        $('#modal-trip-type').val(data.trip_type);
        $('#modal-car-model').val(data.car_model);
        $('#modal-date').val(data.date);
        $('#modal-time').val(data.time);
        $('#modal-return-date').val(data.return_date);
        $('#modal-return-time').val(data.return_time);
        $('#modal-pickup-address').val(data.pickup);
        $('#modal-drop-address').val(data.drop);
        $('#modal-distance').val(data.distance);
        $('#modal-price').val(data.price);
        $('#modal-from-location').val(data.from_location);
        $('#modal-to-location').val(data.to_location);

        // Update display in modal
        if (data.distance) $('#modal-distance-display').text(`Distance: ${data.distance} KM`);
        else $('#modal-distance-display').text('');

        if (data.price) $('#modal-price-display').text(`Estimated Price: ₹${parseInt(data.price).toLocaleString('en-IN')}`);
        else $('#modal-price-display').text('');

        // Show/Hide Return fields
        if (data.return_date || data.return_time) {
            $('#modal-return-date-container, #modal-return-time-container').show();
        } else {
            $('#modal-return-date-container, #modal-return-time-container').hide();
        }

        // Show Modal
        bookingModal.show();
    });

    // Handle Modal Form Submission — Send to WhatsApp
    $('#booking_popup_form').on('submit', function (e) {
        e.preventDefault();
        const $submitBtn = $('#btn-modal-confirm');

        // Validate required fields
        const name = $('#modal-name').val().trim();
        const mobile = $('#modal-mobile').val().trim();
        const email = $('#modal-email').val().trim();
        const termsChecked = $('#modal-terms').is(':checked');

        if (!name || !mobile || !email) {
            $('#modal-error').show().text('Please fill in Name, Mobile, and Email.');
            return;
        }
        if (!termsChecked) {
            $('#modal-error').show().text('Please accept the Terms and Conditions.');
            return;
        }

        $submitBtn.prop('disabled', true).text('Processing...');
        $('#modal-success, #modal-error').hide();

        // Gather all booking data
        const tripType = $('#modal-trip-type').val() || 'N/A';
        const carModel = $('#modal-car-model').val() || 'N/A';
        const date = $('#modal-date').val() || 'N/A';
        const time = $('#modal-time').val() || 'N/A';
        const returnDate = $('#modal-return-date').val() || '';
        const returnTime = $('#modal-return-time').val() || '';
        const distance = $('#modal-distance').val() || 'N/A';
        const price = $('#modal-price').val() || 'N/A';
        const title = $('#modal-title').val() || '';
        const adults = $('#modal-adults').val() || '1';
        const children = $('#modal-children').val() || '0';
        const luggage = $('#modal-luggage').val() || '0';
        const altMobile = $('#modal-alt-mobile').val().trim() || 'N/A';
        const pickupAddress = $('#modal-pickup-address').val().trim() || 'N/A';
        const dropAddress = $('#modal-drop-address').val().trim() || 'N/A';
        const fromLoc = $('#modal-from-location').val() || 'N/A';
        const toLoc = $('#modal-to-location').val() || 'N/A';
        const remarks = $('#modal-remarks').val().trim() || 'None';

        // Build WhatsApp message
        let message = `🚖 *New Booking Enquiry*\n`;
        message += `━━━━━━━━━━━━━━━━━━\n\n`;
        message += `📋 *Trip Details*\n`;
        message += `• Trip Type: *${tripType}*\n`;
        message += `• Car Model: *${carModel}*\n`;
        message += `• From: *${fromLoc}*\n`;
        message += `• To: *${toLoc}*\n`;
        message += `• Distance: *${distance} KM*\n`;
        message += `• Est. Price: *₹${parseInt(price).toLocaleString('en-IN')}*\n\n`;
        message += `📅 *Schedule*\n`;
        message += `• Date: ${date}\n`;
        message += `• Time: ${time}\n`;
        if (returnDate) {
            message += `• Return Date: ${returnDate}\n`;
        }
        if (returnTime) {
            message += `• Return Time: ${returnTime}\n`;
        }
        message += `\n`;
        message += `👤 *Passenger Info*\n`;
        message += `• Name: ${title} ${name}\n`;
        message += `• Mobile: ${mobile}\n`;
        message += `• Alt Mobile: ${altMobile}\n`;
        message += `• Email: ${email}\n`;
        message += `• Adults: ${adults} | Children: ${children}\n`;
        message += `• Luggage: ${luggage}\n\n`;
        message += `📍 *Addresses*\n`;
        message += `• Pickup: ${pickupAddress}\n`;
        message += `• Drop: ${dropAddress}\n\n`;
        if (remarks !== 'None') {
            message += `💬 *Remarks:* ${remarks}\n\n`;
        }
        message += `━━━━━━━━━━━━━━━━━━\n`;
        message += `_Sent from ChennaipremiumDropTaxi.com_`;

        // WhatsApp phone number
        const whatsappNumber = '918681083503';
        const whatsappURL = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;

        // Show success and open WhatsApp
        $('#modal-success').show().text('Redirecting to WhatsApp...');

        setTimeout(() => {
            window.open(whatsappURL, '_blank');
            setTimeout(() => {
                bookingModal.hide();
                $('#booking_popup_form')[0].reset();
                $('#modal-success').hide();
                $submitBtn.prop('disabled', false).html('<i class="fa fa-whatsapp me-2"></i>Send via WhatsApp');
                window.location.reload();
            }, 2000);
        }, 500);
    });
});
