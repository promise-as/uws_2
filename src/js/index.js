$(function () {
  theaMsForm($('.sign-in'),function($data){
    if($data.flag == 'ok'){
      $(".join").css("display", "none");
    }else if($data.flag == 'no'){}
  });

  // 荣誉 每一个num的高度取之对应的detail的高度
  $(".honor .honor-row").each(function (index, ele) {
    $(ele).children($("num")).outerHeight(
        $($(".honor .detail")[index]).outerHeight(true)
    );
  });

  // 隐藏
  function hide(clickEle, goalEle) {
    clickEle.click(function () {
      goalEle.css("display", "none");
    });
  }

  // 关闭广告
  // hide($(".ad .close"), $(".ad"));

  // 关闭弹窗1
  hide($(".test .closeLog"), $(".test"));

  // 关闭弹窗2
  hide($(".join .closeLog"), $(".join"));

  // 报名申请
  $('.check-item input:radio').click(function (e) {
    e.stopPropagation();
    // 如果想要找兄弟元素，先找其父元素然后再找儿子
    $(this).parents('.check-item').find('.user-apply').val($(this).val());
  });

  // 预约试听 弹窗显示
  $(".subscribe").click(function () {
    $(".join").css("display", "block");
  });

  //pc底部的弹窗
  if ($('.xl-bottom').size() > 0) {
    midtc('.xl-bottom', '.xl-close', 8000, 30000, 3, '.bottom-cleardiv');
  }
  if ($(".test").size() > 0) {
    midtc('.test', '.test .closeLog', 15000, 30000, 100, '.test');
  }

  function midtc(ele, c, f, a, n, s) {
    var $par = $(ele);
    var $cleardiv = $(s);
    var $num = 0;
    popupTc(f);
    $(c, $par).click(function () {
      $cleardiv.hide();
      $par.hide();

      $num++;

      if ($num <= n) {
        popupTc(a);
      }
    });

    function popupTc(d) {
      setTimeout(function () {
        $cleardiv.show();
        $par.fadeIn(300);
      }, d);
    }
  }
});