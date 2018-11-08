/**
 * Created by cabbage on 17/06/07.
 */
window.onload = function () {
    Bmob.initialize("ed4aedea541215a93b483fbe0e9c8bc3", "bcfdb82a2462b1e83a535b77ca8104ff");

    if(Bmob.User.current()) {
        if (Bmob.User.current().get("authority") < 100)window.open("login.html", "_self"); else {

            var fileUploadControl = document.getElementById("profilePhotoFileUpload");
            //全局变量

            var types = Bmob.Object.extend("photoTypes");
            var query = new Bmob.Query(types);
            //设置查询对象
            // 查询所有数据
            query.find({
                success: function(results) {
                    for (var i = 0; i < results.length; i++) {
                        var object = results[i];
                        document.getElementById("type").options.add(new Option(object.get("typeName"),object.get("typeName")))
                    }
                },
                error: function(error) {
                    alert("查询失败: " + error.code + " " + error.message);
                }
            });
            //完成为下拉列表加载

            //单选框改变事件
            $('input[type=radio][name=a]').change(function() {
                if (this.id == 'one') {
                    $("#sameDes").css("display","block")
                    $("#mutiDes").css("display","none")
                }
                else if (this.id == 'multiple') {
                    //如果需要单独的描述
                    $("#mutiDes").css("display","block")
                    $("#sameDes").css("display","none")
                    $("#mutiDes").children().remove();
                    //遍历文件夹创建单个description
                    for(var i=0;i<fileUploadControl.files.length;i++){
                        var item = document.createElement("div");
                        item.style.display = "inline-block";

                        var imgItem = document.createElement("img");
                        var textView = document.createElement("input")
                        textView.setAttribute('type', 'text');
                        textView.setAttribute('placeholder','请输入左边照片的描述');
                        textView.style.marginTop = "20px";
                        textView.className = "multiDes";
                        imgItem.style.display = "inline-block";

                        imgItem.style.height = "30px";
                        imgItem.style.width = "30px";
                        imgItem.style.marginTop = "27px";
                        imgItem.style.marginRight = "8px";
                        imgItem.style.marginLeft = "8px"

                        var objUrl = getObjectURL(fileUploadControl.files[i]) ;
                        if (objUrl) {
                            imgItem.src = objUrl;
                        }


                        item.appendChild(imgItem);
                        item.appendChild(textView);
                        document.getElementById("mutiDes").appendChild(item);
                        if((i+1)%3==0){
                            document.getElementById("mutiDes").appendChild(document.createElement("br"));
                        }

                    }
                    //遍历选中的文件

                }
            });


            document.getElementById("submit").onclick = function () {
                if (fileUploadControl.files.length > 0) {
                    //先获取一下公用的变量
                    var Photos = Bmob.Object.extend("Photos");//储存对象
                    var selectIndex = $("input[type='radio']:checked").val();
                    //1 是 公用 2 是定制
                    //开始获取多描述下的描述
                    var desS = new Array();
                    if(selectIndex==2){
                        for(var i=0;i<$(".multiDes").length;i++){
                            if($(".multiDes").eq(i).val()!=""){
                                desS[i] = $(".multiDes").eq(i).val();
                            }
                            else{return;}
                        }
                    }
                    //完成获取多描述
                    var des = $("#des").val();//默认描述是被公用的
                    //开始获取分类
                    var selector1 = document.getElementById("type");
                    var newTYPE = document.getElementById("newType");
                    var index=selector1.selectedIndex;//获取被选中的option的索引
                    var text= selector1.options[index].value;//获取相应的option的内容
                    var typeSelected = selector1.options[index].text;
                    if(text.trim()=="new"){
                        if(newTYPE.value.trim()==""){alert("请选择或新建一个分类");return;}
                        typeSelected = newTYPE.value;
                        var TypeObject = Bmob.Object.extend("photoTypes");
                        var tp = new TypeObject();
                        tp.set("typeName",newTYPE.value);
                        tp.save(null, {
                            success: function(object) {
                                alert("成功创建新分类");
                            },
                            error: function(model, error) {
                                alert("创建新分类失败");
                            }
                        });
                    }
                    //完成获取分类

                    for(var i=0;i<fileUploadControl.files.length;i++){
                        //遍历上传的文件为每一个文件创建对象并储存
                        var PhotoItem = new Photos();
                        //创建BmobFile类
                        var file = fileUploadControl.files[i];
                        var URL = getObjectURL(file);
                        var Suffix = URL.substring(URL.lastIndexOf("."),URL.length);
                        var name = Date.now() + "-" + i+"."+Suffix;
                        var file = new Bmob.File(name, file);

                        PhotoItem.set("type",typeSelected);
                        PhotoItem.set("photo",file);
                        if(selectIndex==1){
                            PhotoItem.set("des",des);
                        }
                        else if(selectIndex==2){
                            //如果是单独描述就出现选取当前的描述
                            PhotoItem.set("des",desS[i]);
                        }
                        else{
                            alert("描述出现异常错误")
                            return;
                        }

                        PhotoItem.save(null, {
                            success: function(object) {
                                object.set("url",object.get("photo").url());
                                object.save();
                                alert("成功上传一张");
                            },
                            error: function(model, error) {
                                alert("错误上传："+error.message);
                            }
                        });//上传

                    }
                    //for结束
                }
                //if结束
            }




        //拥有100权限else结束的位置
        }
    }
    else{window.open("login.html","_self")};  //检查是否有进入后台得到权限  如果没有相应权限就回到登录页

    function getObjectURL(file) {
        var url = null;
        if (window.createObjectURL != undefined) { // basic
            url = window.createObjectURL(file);
        } else if (window.URL != undefined) { // mozilla(firefox)
            url = window.URL.createObjectURL(file);
        } else if (window.webkitURL != undefined) { // webkit or chrome
            url = window.webkitURL.createObjectURL(file);
        }
        return url;
    }
}