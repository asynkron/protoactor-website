let tabId = 0;
$(document).ready(function () {

    $('.tab-content').each(function (inx2, tabContent) {
        $(this).find('.tab-pane').each(function (idx, item) {

            var navTabs = $(this).closest('.code-tabs').find('.nav-tabs');
            title = $(this).attr('title');
            $(this).attr("id", "tab" + tabId);
            if (idx == 0) { //first tab. activate it
                $(this).addClass("active");
                navTabs.append('<li class="nav-item"><a class="nav-link active" data-toggle="tab" role="tab" aria-selected="true" href="#tab' + tabId + '" aria-controls="tab' + tabId + '" >' + title + '</a></li');
            } else {
                navTabs.append('<li class="nav-item"><a class="nav-link" data-toggle="tab" role="tab" aria-selected="false" href="#tab' + tabId + '" aria-controls="tab' + tabId + '" >' + title + '</a></li');
            }

            tabId++;
        });
    })
});