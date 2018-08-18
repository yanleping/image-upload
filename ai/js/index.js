//处理file input加载的图片文件
var _UPLOAD_URL = true;

$(document).ready(function(e) {
	//判断浏览器是否有FileReader接口
	if(typeof FileReader == 'undefined') {
		$("#destination").css({
			'background': 'none'
		}).html('亲,您的浏览器还不支持HTML5的FileReader接口,无法使用图片本地预览,请更新浏览器获得最好体验');
		//如果浏览器是ie
		if($.browser.msie === true) {
			//ie6直接用file input的value值本地预览
			if($.browser.version == 6) {
				$("#imgUpload").change(function(event) {
					//ie6下怎么做图片格式判断?
					var src = event.target.value;
					//var src = document.selection.createRange().text; //选中后 selection对象就产生了 这个对象只适合ie
					var img = '<img src="' + src + '" width="200px" height="200px" />';
					$("#destination").empty().append(img);
				});
			}
			//ie7,8使用滤镜本地预览
			else if($.browser.version == 7 || $.browser.version == 8) {
				$("#imgUpload").change(function(event) {
					$(event.target).select();
					var src = document.selection.createRange().text;
					var dom = document.getElementById('destination');
					//使用滤镜 成功率高
					dom.filters.item('DXImageTransform.Microsoft.AlphaImageLoader').src = src;
					dom.innerHTML = '';
					//使用和ie6相同的方式 设置src为绝对路径的方式 有些图片无法显示 效果没有使用滤镜好
					/*var img = '<img src="'+src+'" width="200px" height="200px" />';
					$("#destination").empty().append(img);*/
				});
			}
		}
		//如果是不支持FileReader接口的低版本firefox 可以用getAsDataURL接口
		else if($.browser.mozilla === true) {
			$("#imgUpload").change(function(event) {
				//firefox2.0没有event.target.files这个属性 就像ie6那样使用value值 但是firefox2.0不支持绝对路径嵌入图片 放弃firefox2.0
				//firefox3.0开始具备event.target.files这个属性 并且开始支持getAsDataURL()这个接口 一直到firefox7.0结束 不过以后都可以用HTML5的FileReader接口了
				if(event.target.files) {
					//console.log(event.target.files);
					for(var i = 0; i < event.target.files.length; i++) {
						var img = '<img src="' + event.target.files.item(i).getAsDataURL() + '" width="200px" height="200px"/>';
						$("#destination").empty().append(img);
					}
				} else {
					//console.log(event.target.value);
					//$("#imgPreview").attr({'src':event.target.value});
				}
			});
		}
	} else {
		//多图上传 input file控件里指定multiple属性 e.target是dom类型
		$("#imgUpload").change(function(e) {
			for(var i = 0; i < e.target.files.length; i++) {
				var file = e.target.files.item(i);
				console.log(file.type)
				//允许文件MIME类型 也可以在input标签中指定accept属性
				//console.log(/^image/.*$/i.test(file.type));
				//if(!(/^image/.*$ / i.test(file.type))) {
				//	continue; //不是图片 就跳出这一次循环
				//}
				if(file.type.indexOf("image") < 0) {
					alert('选择的文件不是图片');
					return false;
				}

				//实例化FileReader API
				var freader = new FileReader();
				freader.readAsDataURL(file);
				freader.onload = function(e) {
					var img = '<img src="' + e.target.result + '"/>';
					$("#destination").empty().append(img);
				}

			}
			clearLabel();
			uploadImg();
		});

		//处理图片拖拽的代码
		var destDom = document.getElementById('destination');
		destDom.addEventListener('dragover', function(event) {
			event.stopPropagation();
			event.preventDefault();
		}, false);

		destDom.addEventListener('drop', function(event) {
			event.stopPropagation();
			event.preventDefault();
			var img_file = event.dataTransfer.files.item(0); //获取拖拽过来的文件信息 暂时取一个
			console.log(img_file.type)
			//console.log(event.dataTransfer.files.item(0).type);
			//if(!('/^image/.*$ /' .test(img_file.type))) {
			//	alert('您还未拖拽任何图片过来,或者您拖拽的不是图片文件');
			//	return false;
			//}
			if(img_file.type.indexOf("image") < 0) {
				alert('选择的文件不是图片');
				return false;
			}
			fReader = new FileReader();
			fReader.readAsDataURL(img_file);
			fReader.onload = function(event) {
				destDom.innerHTML = '';
				destDom.innerHTML = '<img src="' + event.target.result + '"/>';

			};
			clearLabel();
			uploadImg();
		}, false);
	}
	// detection_btn
	$("#avatarSlect").bind("input propertychange change", function(event) {
		var avatarSlect = $("#avatarSlect").val();
		var $destDom = $("#destination");

		if(avatarSlect.length <= 0) {
			showLabel();
			$destDom.empty();
			return;
		}
		var $img = $destDom.find("img");
		if(!$img) {
			$img = $('<img src=""   />');
			//$img = $('<img src=""   onerror="this.src=\"img/timg.jpeg\""/>');
			$destDom.append($img);
		}
		$img.attr("src", avatarSlect);
		clearLabel();
		removeFile();
	});

});

function uploadImg() {
	var data = new FormData();
	if(_UPLOAD_URL){
		data.append("file", "");
		data.append("url", $("#avatarSlect").val());
	}else{
		data.append("file", $("#imgUpload").get(0).files[0]);
		data.append("url", "");
	}
	//alert(data);
	
	$.ajax({
		url: '/Users/ledu/Documents/pyWorkspace/demo/upload.go',//后台url
		method: 'POST',
		data: data,
		contentType: false, // 注意这里应设为false
		processData: false,
		cache: false,
		success: function(result) {
			//根据返回成功信息来对应操作
		},error: function(jqXHR) {
			console.log(JSON.stringify(jqXHR));
		}
	})
}

function clearLabel() {
	$("#sourceImgLabel").hide();
}

function showLabel() {
	$("#sourceImgLabel").show();
}

function removeUrl() {
	$("#avatarSlect").val("");
	_UPLOAD_URL = false;
}

function removeFile() {
	_UPLOAD_URL = true;
}