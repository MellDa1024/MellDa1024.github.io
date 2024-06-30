$(document).ready(() => {
    var allCopypastaData = {};

    function loadCategories() {
        $.getJSON('assets/categories.json', (data) => {
            const container = $("#checkbox-container");
            container.empty();

            data.categories.forEach(category => {
                const checkbox = $(`
                    <label class="checkbox-label" title="${category.information}">
                        <input type="checkbox" value="${category.label}" checked> ${category.name}
                    </label>
                `);
                container.append(checkbox);
            });

            loadCopypastaFiles();
        });
    }

    function loadCopypastaFiles() {
        const selectedFiles = $(".checkbox-container input:checkbox").map(function() {
            return $(this).val();
        }).get();

        const requests = selectedFiles.map(file => $.getJSON(`assets/data/${file}.json`));

        $.when(...requests).done((...responses) => {
            responses.forEach(response => 
                allCopypastaData[response[0].category] = response[0].copypastas
            )
            filterAndDisplayCopypastas();
        });
    }

    function filterAndDisplayCopypastas() {
        const query = $("#search-bar").val().toLowerCase();
        const selectedCategories = $(".checkbox-container input:checked").map(function() {
            return $(this).val();
        }).get();
        const filteredData = []
        selectedCategories.forEach((category) => {
            filteredData.push(...allCopypastaData[category].filter(copypastas => 
                copypastas.keywords.some(keyword => keyword.includes(query))
            ))
        })
        displayCopypastas(filteredData);
    }

    function displayCopypastas(data) {
        const container = $("#copypasta-container");
        container.empty();

        data.forEach((copypasta, index) => {
            const block = $(`
                <div class="copypasta-block">
                    <div class="data" id="data-${index}">${formatText(copypasta.data)}</div>
                    <div class="keywords">${copypasta.keywords.join(", ")}</div>
                    <button class="copy-button" data-target="data-${index}">복사</button>
                </div>
            `);

            container.append(block);
        });

        $(".copy-button").on("click", function() {
            const targetId = $(this).data("target");
            const textToCopy = $(`#${targetId}`).text();
            copyToClipboard(textToCopy);
            const button = $(this);
            button.css("background-color", "#28a745"); // 초록색으로 변경
            button.text("복사 완료!");
            setTimeout(() => {
                button.css("background-color", ""); // 원래 색으로 복원
                button.text("복사");
            }, 1000); // 1초 후에 복원
        });
    }

    function formatText(text, maxLength = 50) {
        const lines = [];
        let currentLine = "";

        text.split(" ").forEach(word => {
            if (currentLine.length + word.length + 1 <= maxLength) {
                currentLine += (currentLine.length > 0 ? " " : "") + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        });
        if (currentLine.length > 0) {
            lines.push(currentLine);
        }

        return lines.join("\n");
    }

    function copyToClipboard(text) {
        const tempElement = $("<textarea>");
        $("body").append(tempElement);
        tempElement.val(text).select();
        document.execCommand("copy");
        tempElement.remove();
    }

    function etcSetting() {
        var now = new Date();
        var soonoong = new Date("2024-11-14");
        var diff = soonoong.getTime() - now.getTime();
        var left = Math.floor(diff / 86400000 + 1);

        $("#etc").text('2025학년도 대학수학능력시험까지 D-' + left);
        $("#etc").append('<div id="etc">정수씨 화이팅!!</div>');
    }
    $("#search-bar").on("input", filterAndDisplayCopypastas);

    $(".checkbox-container").on("change", "input", filterAndDisplayCopypastas);

    etcSetting();
    loadCategories();
});
