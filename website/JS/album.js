var $slicebox;
var skip1 = 8;
window.onload = function () {
    alert("相册功能正在优化中。现在加载将耗费大量流量和内存，而且在加载某些非16：9图片的时候会导致布局被拉扯")
    Bmob.initialize("ed4aedea541215a93b483fbe0e9c8bc3", "bcfdb82a2462b1e83a535b77ca8104ff");
    //初始化Bmob

    loadPicture();

    //初始化轮播插件
    document.getElementById("next").onclick = function () {
        $slicebox.next();
    }

    document.getElementById("previous").onclick = function () {
        $slicebox.previous();
    }

    function loadPicture() {
        var Photo = Bmob.Object.extend("Photos")
        var query = new Bmob.Query(Photo);
        query.find({
            success: function(results){
                for(var i=0;i<results.length;i++){
                    var obj = results[i];
                    var LI = document.createElement("li");
                    var IMG = document.createElement("img");
                    var DIV = document.createElement("div");
                    var H3 = document.createElement("h3");
                    DIV.className = "sb-description";
                    H3.innerHTML = obj.get("des")
                    IMG.src = obj.get("url");
                    LI.appendChild(IMG);
                    DIV.appendChild(H3);
                    LI.appendChild(DIV);
                    document.getElementById("sb-slider").appendChild(LI);
                }

            },
            error: function(error){}
        }).then(function () {
            $slicebox =$('#sb-slider').slicebox({
                orientation:"r"
            });
        })
    }

}