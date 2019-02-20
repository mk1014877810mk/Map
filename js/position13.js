
$(function () {
  var goal = "上海市唐镇";
  map_way(goal);
  function map_way(goal) {
    function G(id) {
      return document.getElementById(id);
    }
    // 获取当前所在的位置
    var geolocation = new BMap.Geolocation();
    geolocation.getCurrentPosition(function (position) {
      var latitude = position.latitude;
      var longitude = position.longitude;

      // 百度地图API功能
      var map = new BMap.Map("l-map");
      map.centerAndZoom(new BMap.Point(longitude, latitude), 16);  // 初始化地图,设置中心点坐标和地图级别   
      var opts = { offset: new BMap.Size(40, 120) }   // 设置比例尺的位置
      map.addControl(new BMap.ScaleControl(opts));   // 添加比例尺控件  
      var ops1 = { offset: new BMap.Size(40, 130) }    // 设置地图放大缩小按钮的位置
      map.addControl(new BMap.NavigationControl(ops1));  // 地图放大缩小控件
      map.addControl(new BMap.MapTypeControl());   //添加地图类型控件
      map.setCurrentCity("上海");          // 设置地图显示的城市 此项是必须设置的
      map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
      // 定位当前位置
      var myValue = position.address.province + position.address.city + position.address.district + position.address.street + position.address.business;
      // 清除地图上所有覆盖物 
      map.clearOverlays();
      // 显示当前位置
      showCurrentPlace();

      // 刚进地图就显示客户当前位置到目的地的步行路线
      var p1 = new BMap.Point(longitude, latitude);
      var p2 = goal;
      var first_end = p2;
      var flag = true;

      // 创建地址解析器实例 
      var myGeo = new BMap.Geocoder();
      // 将地名转换成经纬度    
      myGeo.getPoint(p2, function (point) {
        if (point) {
          p2 = point;
          flag = true;
        } else {
          alert("终点地址有误");
          alert(p2);
          flag = false;
        }
      }, "上海市");

      // 刚进入页面默认画出驾车路线
      if (flag) {
        s_car();
        // 默认选中驾车路线的按钮
        $("#s-car").addClass("active")
      } else {
        alert("终点地址出问题啦");
        return false;
      }
      // 刚进入地图未进行搜索时，点击驾车路线按钮
      $("#s-car").on("click", function () {
        $(this).addClass("active").siblings().removeClass("active");
        $("#way").show();
        if (flag) {
          s_car();
        } else {
          alert("终点地址出问题啦");
          return false;
        }
      })
      // 刚进入地图未进行搜索时，点击公交路线按钮
      $("#s-bus").on("click", function () {
        $(this).addClass("active").siblings().removeClass("active");
        $("#way").show();
        if (flag) {
          s_bus();
        } else {
          alert("终点地址出问题啦");
          return false;
        }
      })
      // 刚进入地图未进行搜索时，点击步行路线按钮
      $("#s-foot").on("click", function () {
        $(this).addClass("active").siblings().removeClass("active");
        $("#way").show();
        if (flag) {
          s_foot();
        } else {
          alert("终点地址出问题啦");
          return false;
        }
      })

      // 点击其他路线时，显示和隐藏起点终点文本框
      var num2 = 0;
      $("#s-more").on("click", function () {
        $(this).siblings().removeClass("active");
        // 首次进入页面时，给起点、终点文本框赋值
        if ($("#startId").val() == "") {
          $("#startId").val("我的位置");
        }
        if ($("#endId").val() == "") {
          $("#endId").val(first_end);
        }
        if ($(this).children().hasClass("icon-yincang4")) {
          $(this).removeClass("active").children().removeClass("icon-yincang4").addClass("icon-gengduo-copy");
        } else {
          $(this).addClass("active").children().removeClass("icon-gengduo-copy").addClass("icon-yincang4");
          $(".method div").removeClass("active");
        }
        $(".current").fadeIn(500);
        // 隐藏与输入相关的下拉菜单
        $(".tangram-suggestion-main").addClass("hide");
        $(".text").slideToggle();
        $(this).siblings().toggle();
        num2++;
        if (num2 % 2 == 1) {
          $(this).addClass("w100");
          $("#way").hide();
        } else {
          $(this).removeClass("w100");
        }
      })

      // 起终点文本框获取焦点时，显示与输入相关的下拉菜单
      $("#startId").on("focus", function () {
        $(".tangram-suggestion-main").removeClass("hide").css("top", $(this).offset().top + 16);
        $(".text").css("width", $(window).width());
        $(".current").fadeOut(500);
      });

      $("#startId").on("blur", function () {
        $(".current").fadeIn(500);
      });

      $("#endId").on("focus", function () {
        $(".tangram-suggestion-main").removeClass("hide");
        $(".current").fadeOut(500);
      });

      $("#endId").on("blur", function () {
        $(".current").fadeIn(500);
      });

      // 输入起点时，显示下拉菜单选项
      var as = new BMap.Autocomplete(    //建立一个自动完成的对象
        {
          "input": "startId"
          , "location": map
        });

      as.addEventListener("onhighlight", function (e) {  //鼠标放在下拉列表上的事件
        e = e || event;
        var str = "";
        var _value = e.fromitem.value;
        var value = "";
        if (e.fromitem.index > -1) {
          value = _value.province + _value.city + _value.district + _value.street + _value.business;
        }
        str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;

        value = "";
        if (e.toitem.index > -1) {
          _value = e.toitem.value;
          value = _value.province + _value.city + _value.district + _value.street + _value.business;
        }
        str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
        G("searchResultPanel").innerHTML = str;
      });

      // 输入终点时，显示下拉菜单选项
      var ae = new BMap.Autocomplete(    //建立一个自动完成的对象
        {
          "input": "endId"
          , "location": map
        });

      ae.addEventListener("onhighlight", function (e) {  //鼠标放在下拉列表上的事件
        e = e || event;

        var str = "";
        var _value = e.fromitem.value;
        var value = "";
        if (e.fromitem.index > -1) {
          value = _value.province + _value.city + _value.district + _value.street + _value.business;
        }
        str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;

        value = "";
        if (e.toitem.index > -1) {
          _value = e.toitem.value;
          value = _value.province + _value.city + _value.district + _value.street + _value.business;
        }
        str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
        G("searchResultPanel").innerHTML = str;
      });
      // 在地图上显示终点的位置
      var myValue;
      ae.addEventListener("onconfirm", function (e) {    //鼠标点击下拉列表后的事件
        var _value = e.item.value;
        myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
        G("searchResultPanel").innerHTML = "onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;
        // 在地图上定位终点的位置
        setPlace();
      });

      // 列表中选择起点时，将选中的起点放到起点文本框中
      $("#r-result").on("click", "#RA_ResItem_0>table td>div[class='selBtn']", function () {
        var value = $(this).parent().prev().children("div").children()[0].innerText.slice(3).trim();
        $("#startId").val(value);
        // 点击选为起点按钮时，让起点下拉框隐藏
        //$("#tangram-suggestion--TANGRAM__1s-main").addClass("hide");
        $("#r-result>div").addClass("hide");
        setHeight();
        setBusHeight();
      });

      // 列表中选择终点时，将选中的终点放到终点文本框中
      $("#r-result").on("click", "#RA_ResItem_1>table td>div[class='selBtn']", function () {
        $("#r-result>div").css("display", "none");
        //var value = $(this).parent().prev().children("div").children()[0].innerText.slice(3);
        //$("#endId").val(value);
        // 点击选为终点按钮时，让终点下拉框隐藏
        //$(".tangram-suggestion-main").addClass("hide");
        $("#r-result>div").addClass("hide");
        setHeight();
        setBusHeight();
      });

      // 步行路线函数
      var nowPlace;
      $("#foot").on("click", function () {
        $(this).addClass("active").siblings().removeClass("active");
        map.clearOverlays();    //清除地图上所有覆盖物
        showCurrentPlace();
        var placeBegin = $("#startId").val();
        var placeStop = $("#endId").val();
        // 将终点地名转换成经纬度 （判断终点的真实性）
        myGeo.getPoint(placeStop, function (point) {
          if (point) {
            placeStop = point;
          } else {
            alert("终点地址有误");
            return false;
          }
        }, "上海市");
        var walking = new BMap.WalkingRoute(map, { renderOptions: { map: map, panel: "r-result", autoViewport: true } });
        if (placeBegin == "我的位置") {
          // 将经纬度转换成具体的地名
          $.ajax({
            url: "http://api.map.baidu.com/geocoder/v2/?callback=renderReverse&location=" + latitude + "," + longitude + "&output=json&pois=1&ak=6yAoynmTPNlTBa8z1X4LfwGE",
            dataType: "jsonp",
            success: function (data) {
              if (data.status == 0) {
                // console.log(data);
                placeBegin = data.result.formatted_address;
                myGeo.getPoint(placeBegin, function (point) {
                  if (point) {
                    placeBegin = point;
                    // 描绘路线
                    walking.search(placeBegin, placeStop);
                    setHeight();
                  } else {
                    alert("起点地址有误");
                    return false;
                  }
                }, "上海市");
              }
            }
          });

        } else {
          // 将起点地名转换成经纬度（判断起点的真实性）
          myGeo.getPoint(placeBegin, function (point) {
            if (point) {
              placeBegin = point;
              // 描绘路线
              console.log(placeBegin, placeStop);
              walking.search(placeBegin, placeStop);
              setHeight();
            } else {
              alert("起点地址有误");
              return false;
            }
          }, "上海市");
        }
        return false;
      });

      // 公交路线函数
      $("#bus").on("click", function () {
        $("#r-result").html("");
        $(this).addClass("active").siblings().removeClass("active");
        map.clearOverlays();    //清除地图上所有覆盖物   
        showCurrentPlace();
        // 获取文本框的内容 
        var placeBegin = $("#startId").val();
        var placeStop = $("#endId").val();
        var transit = new BMap.TransitRoute(map, {
          renderOptions: { map: map, panel: "r-result" }
        });
        if (placeBegin == "我的位置") {
          placeBegin = new BMap.Point(longitude, latitude);
          // 将终点地名转换成经纬度 （判断终点的真实性）
          myGeo.getPoint(placeStop, function (point) {
            if (point) {
              placeStop = point;
              // 描绘地图路线
              transit.search(placeBegin, placeStop);
              setBusHeight();
            } else {
              alert("终点地址有误");
              return false;
            }
          }, "上海市");
        } else {
          // 将起点地名转换成经纬度（判断起点的真实性） 
          myGeo.getPoint(placeBegin, function (point) {
            if (point) {
              placeBegin = point;
              // 将终点地名转换成经纬度 （判断终点的真实性）
              myGeo.getPoint(placeStop, function (point) {
                if (point) {
                  placeStop = point;
                  // 描绘地图路线
                  transit.search(placeBegin, placeStop);
                  setBusHeight();
                } else {
                  alert("终点地址有误");
                  return false;
                }
              }, "上海市");
            } else {
              alert("起点地址有误");
              return false;
            }
          }, "上海市");
        }

        return false;
      });

      // 公交路线中的详情按钮功能
      $("#r-result").on("click", "div>table>tbody>tr button", function (e) {
        if (e.target.name == "xq") {
          return false;
        }
      })
      $("#r-result").on("click", "div>table>tbody>tr p", function () {
        $("#r-result table").toggle();
      })

      // 驾车路线函数
      $("#car").on("click", function () {
        $(this).addClass("active").siblings().removeClass("active");
        map.clearOverlays();    //清除地图上所有覆盖物 
        showCurrentPlace();
        var placeBegin = $("#startId").val();
        var placeStop = $("#endId").val();
        var driving = new BMap.DrivingRoute(map, { renderOptions: { map: map, panel: "r-result", autoViewport: true } });
        if (placeBegin == "我的位置") {
          placeBegin = new BMap.Point(longitude, latitude);
          // 将终点地名转换成经纬度（判断终点的真实性）
          myGeo.getPoint(placeStop, function (point) {
            if (point) {
              placeStop = point;
              // 描绘地图路线
              driving.search(placeBegin, placeStop);
              setHeight();
            } else {
              alert("终点地址有误");
              return false;
            }
          }, "上海市");
        } else {
          // 将起点地名转换成经纬度 （判断起点的真实性）
          myGeo.getPoint(placeBegin, function (point) {
            if (point) {
              placeBegin = point;
              // 将终点地名转换成经纬度（判断终点的真实性）
              myGeo.getPoint(placeStop, function (point) {
                if (point) {
                  placeStop = point;
                  // 描绘地图路线
                  driving.search(placeBegin, placeStop);
                  setHeight();
                } else {
                  alert("终点地址有误");
                  return false;
                }
              }, "上海市");
            } else {
              alert("起点地址有误");
              return false;
            }
          }, "上海市");
        }
        // 去除标签"到百度地图查看"
        var timer_hide;
        setInterval(function () {
          if ($("#r-result .suggest-plan").siblings("a").css("display") != "none") {
            $("#r-result .suggest-plan").siblings("a").css("display", "none");
          } else {
            clearInterval(timer_hide);
          }
        }, 200)
        return false;
      });

      // 阻止冒泡
      $("#r-result").on("click", "p", function (e) {
        e.stopPropagation();
      });

      // 点击r-result显示和隐藏搜索路线结果列表
      // $("#r-result").on("click", "h1", function () {
      //   $("#r-result table").slideToggle();
      //   return false;
      // });

      // 点击驾车和步行按钮之后，通过点击总结果标签，让详细结果面板切换显示隐藏
      $("#r-result").on("click", ".navtrans-view", function () {
        $(this).siblings(".navtrans-res").toggleClass("show");
      });

      // 手动定位当前位置
      $(".current").on("click", function () {
        num = 18;
        showCurrentPlace(num);
      });

      // 根据#r-result的高度设置定位按钮的显示和隐藏
      setInterval(function () {
        if ($("#r-result").height() > $(window).height() / 2) {
          $(".current").addClass("hide");
        } else {
          $(".current").removeClass("hide");
        }
      }, 500)

      // 去掉地图上边的卫星地图显示框
      setInterval(function () {
        $("#l-map div[unselectable='on']").eq(2).css("display", "none")
      }, 200);

      // 动态设置类名为navtrans-res的高度
      var timer = null;
      function setHeight() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          var top = $("#r-start").height() + $("#r-end").height() + $(".method").height() + $("#r-result>div>h1").height() + $("#r-result>div>.navtrans-view.expand").height() + $(".select").height() + 62;
          var height = $(window).height() - top;
          $(".navtrans-res").css({ "max-height": height });
        }, 200);
      };


      function setBusHeight() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          var top = $("#r-start").height() + $("#r-end").height() + $(".method").height() + $(".select").height() + 6;
          var height = $(window).height() - top;
          // 显示公交查询路线时，默认隐藏第一个路线详情
          $(".trans_plan_desc").eq(0).css("display", "none");
          $("#r-result>div").css({
            "max-height": height,
            "overflow": "auto"
          });
          // 动态给公交路线添加详情按钮
          for (var i = 0; i < $(".trans-title").length; i++) {
            $(".trans-title").eq(i).append($("<button name='xq'>详 情</button>"))
          };
          // 判断第一条公交路线是否生成，一旦生成，清除定时器
          if ($(".trans_plan_desc").eq(0).length == 1) {
            clearInterval(timer)
          }
        }, 200);
      };


      // 在地图上定位终点的位置
      function setPlace() {
        //map.clearOverlays();    //清除地图上所有覆盖物
        function myFun() {
          var pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
          map.centerAndZoom(pp, 18);
          map.addOverlay(new BMap.Marker(pp));    //添加标注
        }
        var local = new BMap.LocalSearch(map, { //智能搜索
          onSearchComplete: myFun
        });
        local.search(myValue);
      };


      // 在地图上显示当前所在的位置
      function showCurrentPlace(num) {
        num = num || 18;
        // 重新获取当前的位置
        geolocation.getCurrentPosition(function (position) {
          latitude = position.latitude;
          longitude = position.longitude;
        });
        function myFun() {
          var pp = new BMap.Point(longitude, latitude);    //获取当前定位所在位置的结果
          map.centerAndZoom(pp, num);
          map.addOverlay(new BMap.Marker(pp));    //添加标注
        };
        var local = new BMap.LocalSearch(map, { //智能搜索
          onSearchComplete: myFun
        });
        local.search(myValue);
      };


      // 刚进入页面，显示驾车、步行、公交路线函数
      function s_car() {
        clearInterval(setIn);
        p1 = new BMap.Point(longitude, latitude);
        var output = " ";
        var searchComplete = function (results) {
          if (transit.getStatus() != BMAP_STATUS_SUCCESS) {
            return;
          }
          var plan = results.getPlan(0);
          output += plan.getDuration(true) + " | ";                //获取时间
          output += plan.getDistance(true);             //获取距离
        }
        var transit = new BMap.DrivingRoute(map, {
          renderOptions: { map: map },
          onSearchComplete: searchComplete,
          onPolylinesSet: function () {
            $(".way").html(output);
          }
        });
        transit.search(p1, p2);

        map.clearOverlays();    //清除地图上所有覆盖物
        var driving = new BMap.DrivingRoute(map, { renderOptions: { map: map, autoViewport: true } });
        driving.search(p1, p2);
      };


      var foot_html, setIn;
      function s_foot() {
        map.clearOverlays();    //清除地图上所有覆盖物
        var walking = new BMap.WalkingRoute(map, { renderOptions: { map: map, panel: "hidden", autoViewport: true } });
        if (!nowPlace) {
          // 将经纬度转换成具体的地名
          $.ajax({
            url: "http://api.map.baidu.com/geocoder/v2/?callback=renderReverse&location=" + latitude + "," + longitude + "&output=json&pois=1&ak=6yAoynmTPNlTBa8z1X4LfwGE",
            dataType: "jsonp",
            success: function (data) {
              if (data.status == 0) {
                nowPlace = p1 = data.result.formatted_address;
                myGeo.getPoint(p1, function (point) {
                  if (point) {
                    p1 = point;
                    // 描绘路线
                    walking.search(p1, p2);
                    setHeight();
                  } else {
                    alert("起点地址有误");
                    return false;
                  }
                }, "上海市");
              }
            }
          });
        } else {
          // 将起点地名转换成经纬度（判断起点的真实性）
          var new_place;
          myGeo.getPoint(nowPlace, function (point) {
            if (point) {
              new_place = point;
              walking.search(new_place, p2);
            } else {
              alert("起点地址有误");
              return false;
            }
          }, "上海市");
        }
        // 设置步行时间和距离标签的内容
        clearInterval(setIn);
        setIn = setInterval(function () {
          foot_html = $("#hidden .suggest-plan-des").html()
          $("#way").html(foot_html);
        }, 300);

      };

      var bus_html, temp;
      function s_bus() {
        p1 = new BMap.Point(longitude, latitude);
        map.clearOverlays();    //清除地图上所有覆盖物
        var transit = new BMap.TransitRoute(map, {
          renderOptions: { map: map, panel: "hid" }
        });
        transit.search(p1, p2);
        // 设置公交时间和距离标签的内容
        clearInterval(setIn);
        setIn = setInterval(function () {
          if ($("#hid .trans-title").eq(0).children().eq(1).html()) {
            temp = $("#hid .trans-title").eq(0).children().eq(1).html().split("|");
            bus_html = temp[0] + " | " + temp[1];
            $("#way").html(bus_html);
          }
        }, 300);

      };

    });

  }
});